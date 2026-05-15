import { IsEnum, IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/contribution.entity';

export class InitiateContributionDto {
  @ApiProperty({ example: 'uuid-cycle-id', description: 'ID du cycle actif' })
  @IsUUID()
  @IsNotEmpty()
  cycle_id: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.MTN_MOMO })
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @ApiProperty({ example: '+22960112233', description: 'Numéro Mobile Money (format E.164)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: 'Format E.164 requis' })
  phone_number: string;
}
