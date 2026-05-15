import { Job } from 'bull';
import { NotificationJob } from '../notifications.service';
import { ConfigService } from '@nestjs/config';
export declare class NotificationsProcessor {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    handleSendSms(job: Job<NotificationJob>): Promise<void>;
    handleSendPush(job: Job<NotificationJob>): Promise<void>;
}
