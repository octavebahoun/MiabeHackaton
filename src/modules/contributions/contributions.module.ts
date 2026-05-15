import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { ContributionsController } from './contributions.controller';
import { ContributionsService } from './contributions.service';
import { Contribution } from './entities/contribution.entity';
import { PaymentsModule } from '../payments/payments.module';
import { CyclesModule } from '../cycles/cycles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contribution]),
    PaymentsModule,
    forwardRef(() => CyclesModule), // pour injecter CyclesService dans ContributionsController
    BullModule.registerQueue(
      { name: 'blockchain-queue' },
      { name: 'notifications-queue' },
    ),
  ],
  controllers: [ContributionsController],
  providers: [ContributionsService],
  exports: [ContributionsService],
})
export class ContributionsModule {}
