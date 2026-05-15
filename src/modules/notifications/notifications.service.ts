import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface SendSmsPayload {
  to: string; // e.g. +229xxxxxxxx
  message: string;
}

export interface SendPushPayload {
  token: string;
  title: string;
  body: string;
}

export interface NotificationJob {
  type: 'sms' | 'push';
  payload: SendSmsPayload | SendPushPayload;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue('notifications-queue') private readonly notificationsQueue: Queue,
  ) {}

  async queueSms(payload: SendSmsPayload) {
    this.logger.log(`Ajout d'un SMS dans la file d'attente pour ${payload.to}`);
    await this.notificationsQueue.add('send-sms', {
      type: 'sms',
      payload,
    } as NotificationJob);
  }

  async queuePush(payload: SendPushPayload) {
    this.logger.log(`Ajout d'une Push notification dans la file d'attente`);
    await this.notificationsQueue.add('send-push', {
      type: 'push',
      payload,
    } as NotificationJob);
  }
}
