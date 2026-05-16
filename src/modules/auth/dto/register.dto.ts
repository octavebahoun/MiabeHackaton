import { IsString, IsNotEmpty, Matches, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: '+22960112233', description: 'Numéro de téléphone au format E.164' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Le numéro de téléphone doit être au format E.164 (+229XXXXXXXX)' })
  phone: string;

  @ApiProperty({ example: 'Password123!', description: 'Mot de passe (min 8 chars, 1 majuscule, 1 chiffre, 1 spécial)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'Mot de passe trop faible' })
  password: string;

  @ApiProperty({ example: 'Koffi Mensah', description: 'Nom complet' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  full_name: string;

  @ApiProperty({ example: 'ORGANIZER', enum: ['USER', 'ORGANIZER'], description: 'Rôle de l\'utilisateur' })
  @IsString()
  @IsNotEmpty()
  role: string;
}
