import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    const publicKeyPath = configService.get<string>('JWT_PUBLIC_KEY_PATH');
    let publicKey = '';
    try {
        publicKey = fs.readFileSync(path.resolve(process.cwd(), publicKeyPath), 'utf8');
    } catch (e) {
        console.warn('Could not read JWT_PUBLIC_KEY_PATH, using dummy key for startup');
        publicKey = 'DUMMY_KEY';
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      algorithms: ['RS256'],
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    // Vérifier la blacklist
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    const isBlacklisted = await this.redis.get(`blacklist:${token}`);
    
    if (isBlacklisted) {
      throw new UnauthorizedException('Token révoqué');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.is_active) {
      throw new UnauthorizedException('Utilisateur inactif ou introuvable');
    }

    return user;
  }
}
