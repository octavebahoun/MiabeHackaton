import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export interface CinetPayInitiatePayload {
    amount: number;
    currency: 'XOF';
    transaction_id: string;
    description: string;
    customer_name: string;
    customer_phone_number: string;
    customer_email?: string;
    channels: string;
}
export interface CinetPayWebhookPayload {
    cpm_site_id: string;
    cpm_trans_id: string;
    cpm_trans_date: string;
    cpm_amount: string;
    cpm_currency: string;
    signature: string;
    payment_method: string;
    cpm_result: string;
    cpm_error_message: string;
}
export declare class CinetPayAdapter {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly apiKey;
    private readonly siteId;
    private readonly baseUrl;
    constructor(httpService: HttpService, configService: ConfigService);
    initiatePayment(payload: CinetPayInitiatePayload): Promise<{
        payment_url: string;
        code: string;
    }>;
    verifyWebhookSignature(payload: CinetPayWebhookPayload): boolean;
    checkPaymentStatus(transactionId: string): Promise<string>;
    static getAllowedIps(): string[];
}
