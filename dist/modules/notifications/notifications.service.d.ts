import { Queue } from 'bull';
export interface SendSmsPayload {
    to: string;
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
export declare class NotificationsService {
    private readonly notificationsQueue;
    private readonly logger;
    constructor(notificationsQueue: Queue);
    queueSms(payload: SendSmsPayload): Promise<void>;
    queuePush(payload: SendPushPayload): Promise<void>;
}
