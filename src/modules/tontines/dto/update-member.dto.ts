import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MemberStatus } from '../entities/tontine-member.entity';

export class UpdateMemberDto {
  @ApiProperty({ enum: [MemberStatus.CONFIRMED, MemberStatus.REJECTED], description: 'Statut à appliquer au membre' })
  @IsEnum(MemberStatus)
  @IsNotEmpty()
  status: MemberStatus;
}
