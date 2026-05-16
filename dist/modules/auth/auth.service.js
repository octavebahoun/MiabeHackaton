"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const ioredis_1 = require("@nestjs-modules/ioredis");
const ioredis_2 = __importDefault(require("ioredis"));
const bull_1 = require("@nestjs/bull");
const argon2 = __importStar(require("argon2"));
const config_1 = require("@nestjs/config");
const users_service_1 = require("../users/users.service");
const crypto_util_1 = require("../../common/utils/crypto.util");
const wallets_service_1 = require("../wallets/wallets.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService, walletsService, configService, redis, notificationsQueue) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.walletsService = walletsService;
        this.configService = configService;
        this.redis = redis;
        this.notificationsQueue = notificationsQueue;
    }
    async register(dto) {
        const lockKey = `lock:register:${dto.phone}`;
        const acquired = await this.redis.set(lockKey, 'locked', 'EX', 10, 'NX');
        if (!acquired) {
            throw new common_1.ConflictException('REGISTRATION_IN_PROGRESS');
        }
        try {
            const existingUser = await this.usersService.findByPhone(dto.phone);
            if (existingUser) {
                throw new common_1.ConflictException('PHONE_ALREADY_EXISTS');
            }
            const password_hash = await argon2.hash(dto.password, {
                type: argon2.argon2id,
                memoryCost: 65536,
                timeCost: 3,
                parallelism: 4,
            });
            const user = await this.usersService.create({
                phone: dto.phone,
                password_hash,
                full_name: dto.full_name,
                role: dto.role,
            });
            const otp = (0, crypto_util_1.generateOtp)();
            const hashedOtp = (0, crypto_util_1.hashOtp)(otp);
            await this.redis.set(`otp:${dto.phone}`, hashedOtp, 'EX', 600);
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
        }
        finally {
            await this.redis.del(lockKey);
        }
    }
    async verifyOtp(dto) {
        const attemptsKey = `otp_attempts:${dto.phone}`;
        const attempts = await this.redis.incr(attemptsKey);
        if (attempts === 1) {
            await this.redis.expire(attemptsKey, 3600);
        }
        if (attempts > 3) {
            throw new common_1.UnauthorizedException('TOO_MANY_ATTEMPTS_LOCKED_1H');
        }
        const hashedOtpRecord = await this.redis.get(`otp:${dto.phone}`);
        if (!hashedOtpRecord) {
            throw new common_1.BadRequestException('OTP_EXPIRED_OR_INVALID');
        }
        const inputHashed = (0, crypto_util_1.hashOtp)(dto.otp);
        if (inputHashed !== hashedOtpRecord) {
            throw new common_1.BadRequestException('INVALID_OTP');
        }
        await this.redis.del(`otp:${dto.phone}`);
        await this.redis.del(attemptsKey);
        const user = await this.usersService.findByPhone(dto.phone);
        if (!user) {
            throw new common_1.NotFoundException('USER_NOT_FOUND');
        }
        await this.usersService.activate(user.id);
        this.walletsService.createWalletForUser(user.id).catch((err) => {
            console.error(`Erreur création wallet pour l'utilisateur ${user.id}`, err);
        });
        return {
            message: 'ACCOUNT_ACTIVATED',
            user_id: user.id,
        };
    }
    async validateUser(phone, pass) {
        const user = await this.usersService.findByPhone(phone);
        if (!user)
            return null;
        if (!user.is_active) {
            throw new common_1.UnauthorizedException('ACCOUNT_NOT_ACTIVATED');
        }
        const isValid = await argon2.verify(user.password_hash, pass);
        if (isValid) {
            const { password_hash, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user) {
        const payload = { sub: user.id, phone: user.phone, role: user.role };
        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.signAsync(payload, {
                expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
            }),
            this.jwtService.signAsync(payload, {
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
            }),
        ]);
        await this.redis.set(`refresh_token:${user.id}`, refresh_token, 'EX', 7 * 24 * 60 * 60);
        return {
            access_token,
            refresh_token,
            user: {
                id: user.id,
                phone: user.phone,
                full_name: user.full_name,
                role: user.role,
                wallet_address: user.wallet_address
            }
        };
    }
    async refreshTokens(userId, refreshToken) {
        const storedToken = await this.redis.get(`refresh_token:${userId}`);
        if (!storedToken || storedToken !== refreshToken) {
            throw new common_1.UnauthorizedException('INVALID_REFRESH_TOKEN');
        }
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken);
            const user = await this.usersService.findById(payload.sub);
            if (!user)
                throw new common_1.UnauthorizedException('USER_NOT_FOUND');
            const newPayload = { sub: user.id, phone: user.phone, role: user.role };
            const [new_access, new_refresh] = await Promise.all([
                this.jwtService.signAsync(newPayload, {
                    expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
                }),
                this.jwtService.signAsync(newPayload, {
                    expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
                }),
            ]);
            await this.redis.set(`refresh_token:${userId}`, new_refresh, 'EX', 7 * 24 * 60 * 60);
            return {
                access_token: new_access,
                refresh_token: new_refresh,
                user: {
                    id: user.id,
                    phone: user.phone,
                    full_name: user.full_name,
                    role: user.role,
                    wallet_address: user.wallet_address
                }
            };
        }
        catch (e) {
            if (e instanceof common_1.UnauthorizedException)
                throw e;
            throw new common_1.UnauthorizedException('INVALID_REFRESH_TOKEN');
        }
    }
    async resendOtp(phone) {
        const user = await this.usersService.findByPhone(phone);
        if (!user)
            throw new common_1.NotFoundException('USER_NOT_FOUND');
        if (user.is_active)
            throw new common_1.BadRequestException('ACCOUNT_ALREADY_ACTIVATED');
        const otp = (0, crypto_util_1.generateOtp)();
        const hashedOtp = (0, crypto_util_1.hashOtp)(otp);
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
    async logout(userId, accessToken) {
        try {
            await this.redis.del(`refresh_token:${userId}`);
            const decoded = this.jwtService.decode(accessToken);
            if (decoded && decoded.exp) {
                const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
                if (expiresIn > 0) {
                    await this.redis.set(`blacklist:${accessToken}`, 'true', 'EX', expiresIn);
                }
            }
        }
        catch (error) {
            console.error('Logout error', error);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, ioredis_1.InjectRedis)()),
    __param(5, (0, bull_1.InjectQueue)('notifications-queue')),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        wallets_service_1.WalletsService,
        config_1.ConfigService,
        ioredis_2.default, Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map