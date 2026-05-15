import { Module } from '@nestjs/common';
import { SanctionsService } from './sanctions.service';
import { ScoreModule } from '../score/score.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [ScoreModule, NotificationsModule],
  providers: [SanctionsService],
  exports: [SanctionsService],
})
export class SanctionsModule {}
