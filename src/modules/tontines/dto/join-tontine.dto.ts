import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinTontineDto {
  @ApiProperty({ example: '8E7A3F2B', description: 'Code d\'invitation secret de la tontine' })
  @IsString()
  @IsNotEmpty()
  @Length(8, 8)
  invitation_code: string;
}
