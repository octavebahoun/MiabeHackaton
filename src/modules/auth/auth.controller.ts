import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Public } from '../../common/decorators/public.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Inscription utilisateur + envoi OTP SMS' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé, OTP envoyé.' })
  @ApiResponse({ status: 409, description: 'Numéro de téléphone déjà existant.' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activation du compte via OTP' })
  @ApiResponse({ status: 200, description: 'Compte activé avec succès.' })
  @ApiResponse({ status: 400, description: 'OTP invalide ou expiré.' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Public()
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renvoyer le code OTP par SMS' })
  async resendOtp(@Body('phone') phone: string) {
    return this.authService.resendOtp(phone);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion' })
  @ApiResponse({ status: 200, description: 'Tokens retournés.' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides ou compte inactif.' })
  async login(@Request() req, @Body() dto: LoginDto) {
    // LocalAuthGuard a injecté req.user via LocalStrategy
    return this.authService.login(req.user);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renouvellement du token JWT' })
  async refreshTokens(@Body('refresh_token') refreshToken: string, @Body('user_id') userId: string) {
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Déconnexion (révocation tokens)' })
  async logout(@Request() req, @Headers('authorization') authHeader: string) {
    const token = authHeader.split(' ')[1];
    await this.authService.logout(req.user.id, token);
    return { message: 'LOGGED_OUT_SUCCESSFULLY' };
  }
}
