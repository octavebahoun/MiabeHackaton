import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { CyclesController } from './cycles.controller';
import { CyclesService }    from './cycles.service';
import { Cycle }            from './entities/cycle.entity';
import { Contribution }     from '../contributions/entities/contribution.entity';
import { TontineMember }    from '../tontines/entities/tontine-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cycle, Contribution, TontineMember]),
    BullModule.registerQueue({ name: 'notifications-queue' }),
  ],
  controllers: [CyclesController],
  providers: [CyclesService],
  exports: [CyclesService],
})
export class CyclesModule {}
