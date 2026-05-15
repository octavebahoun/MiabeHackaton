import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { Queue } from 'bull';
import { Contribution, ContributionStatus } from './entities/contribution.entity';
import { InitiateContributionDto } from './dto/initiate-contribution.dto';
import { FedaPayAdapter, FedaPayWebhookPayload } from '../payments/fedapay.adapter';
interface CycleRef {
    id: string;
    tontine_id: string;
    status: string;
    contribution_amount: number;
}
export declare class ContributionsService {
    private readonly contributionRepo;
    private readonly fedaPay;
    private readonly redis;
    private readonly blockchainQueue;
    private readonly notificationsQueue;
    private readonly logger;
    constructor(contributionRepo: Repository<Contribution>, fedaPay: FedaPayAdapter, redis: Redis, blockchainQueue: Queue, notificationsQueue: Queue);
    initiate(userId: string, dto: InitiateContributionDto, cycle: CycleRef): Promise<{
        contribution_id: string;
        payment_ref: string;
        payment_url: string;
        amount: number;
        currency: string;
        status: ContributionStatus;
    }>;
    handleFedaPayWebhook(payload: FedaPayWebhookPayload, rawBody: string, signature: string): Promise<void>;
    findByCycle(cycleId: string): Promise<Contribution[]>;
    findMyHistory(userId: string): Promise<Contribution[]>;
}
export {};
