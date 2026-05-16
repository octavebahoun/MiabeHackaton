import { User } from '../../users/entities/user.entity';
import { TontineMember } from './tontine-member.entity';
export declare enum TontineFrequency {
    WEEKLY = "WEEKLY",
    BIWEEKLY = "BIWEEKLY",
    MONTHLY = "MONTHLY"
}
export declare enum TontineStatus {
    DRAFT = "DRAFT",
    OPEN = "OPEN",
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class Tontine {
    id: string;
    name: string;
    organizer_id: string;
    organizer: User;
    contribution_amount: number;
    frequency: TontineFrequency;
    max_members: number;
    status: TontineStatus;
    invitation_code: string;
    contract_address: string;
    start_date: Date;
    max_absences: number;
    penalty_amount: number;
    members: TontineMember[];
    created_at: Date;
    updated_at: Date;
}
