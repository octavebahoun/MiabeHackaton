import { Request } from 'express';
import { ContributionsService } from './contributions.service';
import { CyclesService } from '../cycles/cycles.service';
import { InitiateContributionDto } from './dto/initiate-contribution.dto';
export declare class ContributionsController {
    private readonly contributionsService;
    private readonly cyclesService;
    constructor(contributionsService: ContributionsService, cyclesService: CyclesService);
    initiate(user: any, dto: InitiateContributionDto): Promise<{
        contribution_id: string;
        payment_ref: string;
        payment_url: string;
        amount: number;
        currency: string;
        status: import("./entities/contribution.entity").ContributionStatus;
    }>;
    fedapayWebhook(req: Request, payload: any, signature: string): Promise<{
        received: boolean;
    }>;
    findByCycle(cycleId: string): Promise<import("./entities/contribution.entity").Contribution[]>;
    findMyHistory(user: any): Promise<import("./entities/contribution.entity").Contribution[]>;
}
