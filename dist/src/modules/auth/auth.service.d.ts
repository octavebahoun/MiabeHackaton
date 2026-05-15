import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { WalletsService } from '../wallets/wallets.service';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly walletsService;
    private readonly configService;
    private readonly redis;
    private readonly notificationsQueue;
    constructor(usersService: UsersService, jwtService: JwtService, walletsService: WalletsService, configService: ConfigService, redis: Redis, notificationsQueue: Queue);
    register(dto: RegisterDto): Promise<{
        message: string;
        user_id: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        message: string;
        user_id: string;
    }>;
    validateUser(phone: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    refreshTokens(userId: string, refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logout(userId: string, accessToken: string): Promise<void>;
}
