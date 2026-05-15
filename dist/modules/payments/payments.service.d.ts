import { FedaPayAdapter, FedaPayInitiatePayload } from './fedapay.adapter';
export declare class PaymentsService {
    private readonly fedapayAdapter;
    private readonly logger;
    constructor(fedapayAdapter: FedaPayAdapter);
    initiatePayment(payload: FedaPayInitiatePayload): Promise<{
        payment_url: string;
        transaction_id: number;
        token: string;
    }>;
    verifyWebhookSignature(rawBody: string, signature: string): boolean;
    checkPaymentStatus(transactionId: number): Promise<"approved" | "declined" | "pending">;
}
