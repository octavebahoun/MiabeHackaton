import { ConfigService } from '@nestjs/config';
export interface FedaPayInitiatePayload {
    amount: number;
    currency: 'XOF';
    transaction_id: string;
    description: string;
    customer_full_name: string;
    customer_phone_number: string;
}
export interface FedaPayWebhookPayload {
    event: string;
    data: {
        object: {
            id: number;
            reference: string;
            status: string;
            amount: number;
            currency: {
                iso: string;
            };
            description: string;
        };
    };
}
export declare class FedaPayAdapter {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    initiatePayment(payload: FedaPayInitiatePayload): Promise<{
        payment_url: string;
        transaction_id: number;
        token: string;
    }>;
    verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean;
    checkPaymentStatus(transactionId: number): Promise<'approved' | 'declined' | 'pending'>;
    private resolveCountryCode;
    static isSuccessEvent(event: string): boolean;
    static isFailureEvent(event: string): boolean;
}
