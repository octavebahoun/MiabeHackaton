import { ContributionsService } from './contributions.service';
import { InitiateContributionDto } from './dto/initiate-contribution.dto';
export declare class ContributionsController {
    private readonly contributionsService;
    constructor(contributionsService: ContributionsService);
    initiate(user: any, dto: InitiateContributionDto): Promise<{
        contribution_id: string;
        payment_ref: string;
        payment_url: string;
        amount: number;
        currency: string;
        status: import("./entities/contribution.entity").ContributionStatus;
    }>;
    cinetpayWebhook(payload: any, clientIp: string): Promise<{
        code: string;
        message: string;
    }>;
    findByCycle(cycleId: string): Promise<import("./entities/contribution.entity").Contribution[]>;
    findMyHistory(user: any): Promise<import("./entities/contribution.entity").Contribution[]>;
}
