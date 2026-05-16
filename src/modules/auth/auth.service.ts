import { Injectable, ConflictException, UnauthorizedException, BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { generateOtp, hashOtp } from '../../common/utils/crypto.util';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly walletsService: WalletsService,
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
    @InjectQueue('notifications-queue') private readonly notificationsQueue: Queue,
  ) {}

  /**
   * POST /auth/register
   * - Vérifie unicité téléphone
   * - Hash password (Argon2id)
   * - Crée user PENDING
   * - Génère OTP + sauvegarde Redis (TTL 10min)
   * - Envoie SMS via queue
   */
  async register(dto: RegisterDto): Promise<{ message: string; user_id: string }> {
    // 1. Vérification existance avec verrouillage Redis anti-race condition
    const lockKey = `lock:register:${dto.phone}`;
    const acquired = await this.redis.set(lockKey, 'locked', 'EX', 10, 'NX');
    if (!acquired) {
      throw new ConflictException('REGISTRATION_IN_PROGRESS');
    }

    try {
      const existingUser = await this.usersService.findByPhone(dto.phone);
      if (existingUser) {
        throw new ConflictException('PHONE_ALREADY_EXISTS');
      }

      // 2. Hash du mot de passe
      const password_hash = await argon2.hash(dto.password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });

      // 3. Création utilisateur (status: PENDING, via valeur par défaut is_active: false)
      const user = await this.usersService.create({
        phone: dto.phone,
        password_hash,
        full_name: dto.full_name,
        role: dto.role as any,
      });

      // 4. Génération OTP (6 chiffres)
      const otp = generateOtp();
      const hashedOtp = hashOtp(otp);

      // Stockage Redis avec expiration de 10 minutes (600s)
      await this.redis.set(`otp:${dto.phone}`, hashedOtp, 'EX', 600);

      // 5. Envoi SMS via BullMQ
      await this.notificationsQueue.add('send-sms', {
        type: 'sms',
        payload: {
          to: dto.phone,
          message: `TontineChain - Votre code de vérification (OTP) est : ${otp}. Ne le partagez avec personne.`,
        }
      });

      return {
        message: 'OTP_SENT',
        user_id: user.id,
      };
    } finally {
      await this.redis.del(lockKey);
    }
  }

  /**
   * POST /auth/verify-otp
   * - Vérifie OTP dans Redis
   * - Active compte
   * - Déclenche création wallet
   */
  async verifyOtp(dto: VerifyOtpDto): Promise<{ message: string; user_id: string }> {
    const attemptsKey = `otp_attempts:${dto.phone}`;
    const attempts = await this.redis.incr(attemptsKey);

    // Blocage après 3 tentatives (1 heure)
    if (attempts === 1) {
      await this.redis.expire(attemptsKey, 3600); // 1h
    }
    if (attempts > 3) {
      throw new UnauthorizedException('TOO_MANY_ATTEMPTS_LOCKED_1H');
    }

    // Récupération OTP Redis
    const hashedOtpRecord = await this.redis.get(`otp:${dto.phone}`);
    if (!hashedOtpRecord) {
      throw new BadRequestException('OTP_EXPIRED_OR_INVALID');
    }

    // Vérification
    const inputHashed = hashOtp(dto.otp);
    if (inputHashed !== hashedOtpRecord) {
      throw new BadRequestException('INVALID_OTP');
    }

    // Validation OK -> on nettoie
    await this.redis.del(`otp:${dto.phone}`);
    await this.redis.del(attemptsKey);

    // Activation de l'utilisateur
    const user = await this.usersService.findByPhone(dto.phone);
    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    await this.usersService.activate(user.id);

    // Création asynchrone du Wallet Custodial
    // On ne l'attend pas pour répondre à l'utilisateur rapidement
    this.walletsService.createWalletForUser(user.id).catch((err) => {
      console.error(`Erreur création wallet pour l'utilisateur ${user.id}`, err);
    });

    return {
      message: 'ACCOUNT_ACTIVATED',
      user_id: user.id,
    };
  }

  /**
   * Méthode appelée par LocalStrategy (Passport)
   */
  async validateUser(phone: string, pass: string): Promise<any> {
    const user = await this.usersService.findByPhone(phone);
    if (!user) return null;

    if (!user.is_active) {
      throw new UnauthorizedException('ACCOUNT_NOT_ACTIVATED');
    }

    const isValid = await argon2.verify(user.password_hash, pass);
    if (isValid) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * POST /auth/login (après passage par LocalStrategy)
   */
  async login(user: any): Promise<{ access_token: string; refresh_token: string }> {
    const payload = { sub: user.id, phone: user.phone, role: user.role };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m') as any,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d') as any,
      }),
    ]);

    // Enregistrement du refresh token dans Redis (pour pouvoir le révoquer plus tard)
    await this.redis.set(`refresh_token:${user.id}`, refresh_token, 'EX', 7 * 24 * 60 * 60);

    return { access_token, refresh_token };
  }

  /**
   * POST /auth/refresh
   */
  async refreshTokens(userId: string, refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    // 1. Vérification dans Redis
    const storedToken = await this.redis.get(`refresh_token:${userId}`);
    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedException('INVALID_REFRESH_TOKEN');
    }

    try {
      // 2. Vérification validité (signature + expiration)
      const payload = await this.jwtService.verifyAsync(refreshToken);

      // 3. Génération nouveaux tokens
      const newPayload = { sub: payload.sub, phone: payload.phone, role: payload.role };
      const [new_access, new_refresh] = await Promise.all([
        this.jwtService.signAsync(newPayload, {
          expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m') as any,
        }),
        this.jwtService.signAsync(newPayload, {
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d') as any,
        }),
      ]);

      // 4. Rotation du refresh token dans Redis
      await this.redis.set(`refresh_token:${userId}`, new_refresh, 'EX', 7 * 24 * 60 * 60);

      return {
        access_token: new_access,
        refresh_token: new_refresh,
      };
    } catch (e) {
      throw new UnauthorizedException('INVALID_REFRESH_TOKEN');
    }
  }

  /**
   * POST /auth/resend-otp
   */
  async resendOtp(phone: string): Promise<{ message: string }> {
    const user = await this.usersService.findByPhone(phone);
    if (!user) throw new NotFoundException('USER_NOT_FOUND');
    if (user.is_active) throw new BadRequestException('ACCOUNT_ALREADY_ACTIVATED');

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);
    await this.redis.set(`otp:${phone}`, hashedOtp, 'EX', 600);

    await this.notificationsQueue.add('send-sms', {
      type: 'sms',
      payload: {
        to: phone,
        message: `TontineChain - Votre nouveau code de vérification (OTP) est : ${otp}.`,
      }
    });

    return { message: 'OTP_RESENT' };
  }

  /**
   * POST /auth/logout
   */
  async logout(userId: string, accessToken: string): Promise<void> {
    try {
      // 1. Suppression du refresh token
      await this.redis.del(`refresh_token:${userId}`);

      // 2. Blacklist de l'access token jusqu'à son expiration naturelle
      const decoded = this.jwtService.decode(accessToken) as any;
      if (decoded && decoded.exp) {
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        if (expiresIn > 0) {
          await this.redis.set(`blacklist:${accessToken}`, 'true', 'EX', expiresIn);
        }
      }
    } catch (error) {
      // Ignorer silencieusement si token invalide à la déconnexion
      console.error('Logout error', error);
    }
  }
}
