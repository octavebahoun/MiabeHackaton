import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

export interface CinetPayInitiatePayload {
  amount: number;
  currency: 'XOF';
  transaction_id: string; // = payment_ref
  description: string;
  customer_name: string;
  customer_phone_number: string;
  customer_email?: string;
  channels: string; // 'MOBILE_MONEY'
}

export interface CinetPayWebhookPayload {
  cpm_site_id: string;
  cpm_trans_id: string;
  cpm_trans_date: string;
  cpm_amount: string;
  cpm_currency: string;
  signature: string;
  payment_method: string;
  cpm_result: string; // '00' = succès
  cpm_error_message: string;
}

@Injectable()
export class CinetPayAdapter {
  private readonly logger = new Logger(CinetPayAdapter.name);
  private readonly apiKey: string;
  private readonly siteId: string;
  private readonly baseUrl = 'https://api-checkout.cinetpay.com/v2';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey  = this.configService.get<string>('CINETPAY_API_KEY', '');
    this.siteId  = this.configService.get<string>('CINETPAY_SITE_ID', '');
  }

  /**
   * Initie un paiement Mobile Money via CinetPay.
   * Retourne le payment_url pour redirection ou undefined si paiement direct.
   */
  async initiatePayment(payload: CinetPayInitiatePayload): Promise<{ payment_url: string; code: string }> {
    const body = {
      apikey: this.apiKey,
      site_id: this.siteId,
      ...payload,
      notify_url: this.configService.get<string>('CINETPAY_NOTIFY_URL'),
      return_url: this.configService.get<string>('CINETPAY_RETURN_URL'),
    };

    this.logger.log(`Initiation CinetPay — ref: ${payload.transaction_id}`);

    const response = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/payment`, body, {
        timeout: 10_000,
      }),
    );

    return {
      payment_url: response.data?.data?.payment_url ?? '',
      code: response.data?.code ?? '',
    };
  }

  /**
   * Vérifie la signature HMAC-SHA256 d'un webhook CinetPay.
   * Protège contre les faux webhooks de tiers malveillants.
   */
  verifyWebhookSignature(payload: CinetPayWebhookPayload): boolean {
    const secretKey = this.configService.get<string>('CINETPAY_SECRET_KEY', '');

    // Données à signer selon la doc CinetPay
    const dataToSign = [
      payload.cpm_site_id,
      payload.cpm_trans_date,
      payload.cpm_trans_id,
      payload.cpm_amount,
      payload.cpm_currency,
    ].join('');

    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(dataToSign)
      .digest('hex');

    const isValid = expectedSignature === payload.signature;
    if (!isValid) {
      this.logger.warn(`Signature CinetPay invalide — trans: ${payload.cpm_trans_id}`);
    }
    return isValid;
  }

  /**
   * Interroge CinetPay pour vérifier le statut d'une transaction (polling).
   * Utile pour les paiements en attente depuis plus de 30 minutes.
   */
  async checkPaymentStatus(transactionId: string): Promise<string> {
    const body = {
      apikey: this.apiKey,
      site_id: this.siteId,
      transaction_id: transactionId,
    };

    const response = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/payment/check`, body, { timeout: 10_000 }),
    );

    // 'ACCEPTED' | 'REFUSED' | 'PENDING'
    return response.data?.data?.status ?? 'PENDING';
  }

  /** IPs légitimes de CinetPay (pour le filtrage du webhook) */
  static getAllowedIps(): string[] {
    return [
      '154.72.168.0',
      '154.72.169.0',
      '154.72.162.0',
    ];
  }
}
