import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TontinesController } from './tontines.controller';
import { TontinesService } from './tontines.service';
import { TontinesRepository } from './tontines.repository';
import { Tontine } from './entities/tontine.entity';
import { TontineMember } from './entities/tontine-member.entity';
import { UsersModule } from '../users/users.module';
import { CyclesModule } from '../cycles/cycles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tontine, TontineMember]),
    UsersModule,
    forwardRef(() => CyclesModule),
  ],
  controllers: [TontinesController],
  providers: [TontinesService, TontinesRepository],
  exports: [TontinesService],
})
export class TontinesModule {}
