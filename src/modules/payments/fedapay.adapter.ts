import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import FedaPay from 'fedapay';

export interface FedaPayInitiatePayload {
  amount: number;
  currency: 'XOF';
  transaction_id: string; // = payment_ref — garantit l'idempotence
  description: string;
  customer_full_name: string;
  customer_phone_number: string; // format E.164 ex: +22960112233
}

export interface FedaPayWebhookPayload {
  event: string; // ex: 'transaction.approved'
  data: {
    object: {
      id: number;
      reference: string;        // = notre payment_ref
      status: string;           // 'approved' | 'declined' | 'pending'
      amount: number;
      currency: { iso: string };
      description: string;
    };
  };
}

@Injectable()
export class FedaPayAdapter {
  private readonly logger = new Logger(FedaPayAdapter.name);

  constructor(private readonly configService: ConfigService) {
    // Initialisation globale du SDK FedaPay
    FedaPay.setApiKey(this.configService.get<string>('FEDAPAY_SECRET_KEY', ''));
    FedaPay.setEnvironment(
      this.configService.get<string>('NODE_ENV') === 'production' ? 'live' : 'sandbox',
    );
  }

  // ──────────────────────────────────────────────
  // 1. INITIER UN PAIEMENT MOBILE MONEY
  // ──────────────────────────────────────────────

  async initiatePayment(payload: FedaPayInitiatePayload): Promise<{
    payment_url: string;
    transaction_id: number;
    token: string;
  }> {
    this.logger.log(`Initiation FedaPay — ref: ${payload.transaction_id}`);

    // Extraire le pays depuis le numéro E.164 (ex: +229 → BJ)
    const countryCode = this.resolveCountryCode(payload.customer_phone_number);
    // Retirer le préfixe international pour FedaPay
    const localPhone = payload.customer_phone_number.replace(/^\+\d{3}/, '');

    const transaction = await FedaPay.Transaction.create({
      description: payload.description,
      amount: payload.amount,
      currency: { iso: payload.currency },
      callback_url: this.configService.get<string>('FEDAPAY_CALLBACK_URL', ''),
      // FedaPay utilise `reference` pour notre identifiant externe
      metadata: { payment_ref: payload.transaction_id },
      customer: {
        firstname: payload.customer_full_name.split(' ')[0] ?? payload.customer_full_name,
        lastname:  payload.customer_full_name.split(' ').slice(1).join(' ') || '-',
        phone_number: {
          number:  localPhone,
          country: countryCode,
        },
      },
    });

    // Générer le token de paiement (retourne l'URL de la page de paiement)
    const tokenObj = await transaction.generateToken();

    this.logger.log(`Paiement FedaPay créé — tx_id: ${transaction.id}, url: ${tokenObj.url}`);

    return {
      payment_url: tokenObj.url,
      transaction_id: transaction.id as number,
      token: tokenObj.token as string,
    };
  }

  // ──────────────────────────────────────────────
  // 2. VÉRIFICATION SIGNATURE WEBHOOK
  // ──────────────────────────────────────────────

  /**
   * Vérifie la signature HMAC-SHA256 du webhook FedaPay.
   * FedaPay envoie la signature dans le header `x-fedapay-signature`.
   * Format du header: "sha256=<hex_digest>"
   */
  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
    const webhookSecret = this.configService.get<string>('FEDAPAY_WEBHOOK_SECRET', '');

    if (!signatureHeader || !webhookSecret) {
      this.logger.warn('Signature ou secret webhook manquant');
      return false;
    }

    // Le header est au format "sha256=<hex>"
    const [algo, receivedDigest] = signatureHeader.split('=');
    if (algo !== 'sha256') return false;

    const expectedDigest = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody, 'utf8')
      .digest('hex');

    // Comparaison en temps constant (protection contre les timing attacks)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedDigest, 'hex'),
      Buffer.from(receivedDigest,  'hex'),
    );

    if (!isValid) {
      this.logger.warn(`Signature FedaPay invalide — reçue: ${receivedDigest}`);
    }

    return isValid;
  }

  // ──────────────────────────────────────────────
  // 3. VÉRIFICATION DE STATUT (polling fallback)
  // ──────────────────────────────────────────────

  async checkPaymentStatus(transactionId: number): Promise<'approved' | 'declined' | 'pending'> {
    const transaction = await FedaPay.Transaction.retrieve(transactionId);
    const status = transaction.status as string;

    if (status === 'approved') return 'approved';
    if (status === 'declined' || status === 'canceled') return 'declined';
    return 'pending';
  }

  // ──────────────────────────────────────────────
  // UTILITAIRE INTERNE
  // ──────────────────────────────────────────────

  private resolveCountryCode(phone: string): string {
    // Mapping des préfixes E.164 → code ISO
    const prefixMap: Record<string, string> = {
      '+229': 'BJ', // Bénin
      '+225': 'CI', // Côte d'Ivoire
      '+228': 'TG', // Togo
      '+226': 'BF', // Burkina Faso
      '+221': 'SN', // Sénégal
      '+223': 'ML', // Mali
      '+224': 'GN', // Guinée
      '+237': 'CM', // Cameroun
    };

    for (const [prefix, code] of Object.entries(prefixMap)) {
      if (phone.startsWith(prefix)) return code;
    }

    return 'BJ'; // Par défaut : Bénin (marché principal TontineChain)
  }

  /** Événements webhook FedaPay indiquant un paiement réussi */
  static isSuccessEvent(event: string): boolean {
    return event === 'transaction.approved';
  }

  /** Événements webhook FedaPay indiquant un paiement échoué */
  static isFailureEvent(event: string): boolean {
    return ['transaction.declined', 'transaction.canceled'].includes(event);
  }
}
