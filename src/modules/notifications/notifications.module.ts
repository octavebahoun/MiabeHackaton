import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationsService } from './notifications.service';
import { NotificationsProcessor } from './workers/notifications.processor';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications-queue',
    }),
  ],
  providers: [NotificationsService, NotificationsProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
