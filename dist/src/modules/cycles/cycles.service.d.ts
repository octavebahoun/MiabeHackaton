import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { Cycle } from './entities/cycle.entity';
import { Contribution } from '../contributions/entities/contribution.entity';
import { TontineMember } from '../tontines/entities/tontine-member.entity';
interface CreateCyclesParams {
    tontineId: string;
    confirmedMembers: TontineMember[];
    contributionAmount: number;
}
export declare class CyclesService {
    private readonly cycleRepo;
    private readonly contributionRepo;
    private readonly notificationsQueue;
    private readonly logger;
    constructor(cycleRepo: Repository<Cycle>, contributionRepo: Repository<Contribution>, notificationsQueue: Queue);
    createCycles(params: CreateCyclesParams): Promise<Cycle[]>;
    getCurrentCycle(tontineId: string): Promise<Cycle | null>;
    findById(cycleId: string): Promise<Cycle>;
    findByTontine(tontineId: string): Promise<Cycle[]>;
    checkCycleCompletion(cycleId: string): Promise<void>;
    private completeCycleAndAdvance;
    updatePayoutTxHash(cycleId: string, txHash: string): Promise<void>;
}
export {};
