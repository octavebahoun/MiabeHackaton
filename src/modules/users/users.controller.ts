import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';

class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  full_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me
   * Profil complet de l'utilisateur connecté (sans le hash du mot de passe).
   */
  @Get('me')
  @ApiOperation({ summary: 'Mon profil complet' })
  async getMe(@CurrentUser() user: User) {
    const fresh = await this.usersService.findById(user.id);
    const { password_hash, ...safeUser } = fresh as any;
    return safeUser;
  }

  /**
   * PATCH /users/me
   * Modifier son nom ou email.
   */
  @Patch('me')
  @ApiOperation({ summary: 'Modifier mon profil (nom, email)' })
  async updateMe(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  /**
   * GET /users/:id/score
   * Score de fiabilité d'un autre utilisateur (pour décider de l'accepter dans une tontine).
   */
  @Get(':id/score')
  @ApiOperation({ summary: 'Score de fiabilité d\'un utilisateur' })
  @ApiResponse({ status: 200, description: '{ user_id, full_name, credit_score, score_label }' })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  async getScore(@Param('id') targetId: string, @CurrentUser() user: User) {
    return this.usersService.getScoreById(user.id, targetId);
  }
}
