import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationJob, SendSmsPayload, SendPushPayload } from '../notifications.service';
import { ConfigService } from '@nestjs/config';

// Import Firebase Admin SDK conditionally
import * as admin from 'firebase-admin';

@Processor('notifications-queue')
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly configService: ConfigService) {}

  @Process('send-sms')
  async handleSendSms(job: Job<NotificationJob>) {
    this.logger.debug(`[Job ${job.id}] Début du traitement de l'envoi SMS`);
    const payload = job.data.payload as SendSmsPayload;
    
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const fromPhone = this.configService.get<string>('TWILIO_PHONE_NUMBER');
    
    if (!accountSid || !authToken || !fromPhone) {
      this.logger.log(`[STUB SMS] Config Twilio absente. Message pour ${payload.to}: "${payload.message}"`);
      return;
    }

    try {
      // Lazy load Twilio pour éviter les erreurs si non configuré
      const twilio = require('twilio');
      const client = twilio(accountSid, authToken);

      const message = await client.messages.create({
        body: payload.message,
        from: fromPhone,
        to: payload.to,
      });

      this.logger.log(`[REAL SMS] Envoyé à ${payload.to} via Twilio (SID: ${message.sid})`);
    } catch (error) {
      this.logger.error(`[Twilio Error] Echec de l'envoi SMS à ${payload.to}: ${error.message}`);
      throw error; // Permet à BullMQ de retenter
    }

    this.logger.debug(`[Job ${job.id}] SMS traité avec succès`);
  }

  @Process('send-push')
  async handleSendPush(job: Job<NotificationJob>) {
    this.logger.debug(`[Job ${job.id}] Début du traitement de la notification Push`);
    const payload = job.data.payload as SendPushPayload;

    try {
      if (admin.apps.length > 0) {
        await admin.messaging().send({
          token: payload.token,
          notification: {
            title: payload.title,
            body: payload.body,
          },
        });
        this.logger.log(`[Push FCM] Notification envoyée: "${payload.title}"`);
      } else {
        this.logger.warn(`[STUB Push FCM] Firebase n'est pas initialisé. Titre: "${payload.title}"`);
      }
    } catch (error) {
      this.logger.error(`[Push FCM] Erreur lors de l'envoi: ${error.message}`);
      throw error; // Re-throw to let BullMQ retry
    }

    this.logger.debug(`[Job ${job.id}] Push traité avec succès`);
  }
}
