import { Tontine } from '../../tontines/entities/tontine.entity';
import { User } from '../../users/entities/user.entity';
export declare enum CycleStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED"
}
export declare class Cycle {
    id: string;
    tontine_id: string;
    tontine: Tontine;
    cycle_number: number;
    beneficiary_id: string;
    beneficiary: User;
    status: CycleStatus;
    total_expected: number;
    total_collected: number;
    payout_tx_hash: string;
    starts_at: Date;
    ends_at: Date;
    created_at: Date;
}
