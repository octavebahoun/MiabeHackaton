import { Injectable, Logger } from '@nestjs/common';
import { FedaPayAdapter, FedaPayInitiatePayload } from './fedapay.adapter';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly fedapayAdapter: FedaPayAdapter) {}

  async initiatePayment(payload: FedaPayInitiatePayload) {
    this.logger.log(`Initiation du paiement via PaymentsService pour ${payload.transaction_id}`);
    return this.fedapayAdapter.initiatePayment(payload);
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    return this.fedapayAdapter.verifyWebhookSignature(rawBody, signature);
  }

  async checkPaymentStatus(transactionId: number) {
    return this.fedapayAdapter.checkPaymentStatus(transactionId);
  }
}
