import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
        user_id: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        message: string;
        user_id: string;
    }>;
    login(req: any, dto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    refreshTokens(refreshToken: string, userId: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logout(req: any, authHeader: string): Promise<{
        message: string;
    }>;
}
