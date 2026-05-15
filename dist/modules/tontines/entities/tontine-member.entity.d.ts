import { Tontine } from './tontine.entity';
import { User } from '../../users/entities/user.entity';
export declare enum MemberRole {
    ORGANIZER = "ORGANIZER",
    MEMBER = "MEMBER"
}
export declare enum MemberStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    REJECTED = "REJECTED"
}
export declare class TontineMember {
    id: string;
    tontine_id: string;
    tontine: Tontine;
    user_id: string;
    user: User;
    role: MemberRole;
    status: MemberStatus;
    payout_order: number;
    joined_at: Date;
}
