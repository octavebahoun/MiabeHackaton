import { IsString, IsNotEmpty, IsNumber, Min, Max, IsEnum, IsOptional, IsDateString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TontineFrequency } from '../entities/tontine.entity';

export class CreateTontineDto {
  @ApiProperty({ example: 'Voyage Dubai 2027', description: 'Nom de la tontine (3-100 chars)' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  name: string;

  @ApiProperty({ example: 50000, description: 'Montant de cotisation périodique (en XOF)' })
  @IsNumber()
  @Min(1000)
  contribution_amount: number;

  @ApiProperty({ enum: TontineFrequency, example: TontineFrequency.MONTHLY })
  @IsEnum(TontineFrequency)
  frequency: TontineFrequency;

  @ApiProperty({ example: 10, description: 'Nombre maximum de membres autorisés (2 à 50)' })
  @IsNumber()
  @Min(2)
  @Max(50)
  max_members: number;

  @ApiProperty({ example: '2026-08-01T00:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  start_date?: Date;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  max_absences?: number;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  penalty_amount?: number;
}
