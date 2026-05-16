import { TontinesService } from './tontines.service';
import { CyclesService } from '../cycles/cycles.service';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';
import { JoinTontineDto } from './dto/join-tontine.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { User } from '../users/entities/user.entity';
export declare class TontinesController {
    private readonly tontinesService;
    private readonly cyclesService;
    constructor(tontinesService: TontinesService, cyclesService: CyclesService);
    create(user: User, dto: CreateTontineDto): Promise<import("./entities/tontine.entity").Tontine>;
    findMyTontines(user: User): Promise<{
        my_role: import("./entities/tontine-member.entity").MemberRole;
        my_status: import("./entities/tontine-member.entity").MemberStatus;
        current_cycle: import("../cycles/entities/cycle.entity").Cycle;
        my_contribution_status: string;
        id: string;
        name: string;
        organizer_id: string;
        organizer: User;
        contribution_amount: number;
        frequency: import("./entities/tontine.entity").TontineFrequency;
        max_members: number;
        status: import("./entities/tontine.entity").TontineStatus;
        invitation_code: string;
        contract_address: string;
        start_date: Date;
        max_absences: number;
        penalty_amount: number;
        members: import("./entities/tontine-member.entity").TontineMember[];
        created_at: Date;
        updated_at: Date;
    }[]>;
    findById(id: string, user: User): Promise<import("./entities/tontine.entity").Tontine>;
    update(id: string, user: User, dto: UpdateTontineDto): Promise<import("./entities/tontine.entity").Tontine>;
    open(id: string, user: User): Promise<{
        message: string;
    }>;
    start(id: string, user: User): Promise<{
        message: string;
    }>;
    join(id: string, user: User, dto: JoinTontineDto): Promise<{
        message: string;
    }>;
    getMembers(id: string, user: User): Promise<{
        id: string;
        role: import("./entities/tontine-member.entity").MemberRole;
        status: import("./entities/tontine-member.entity").MemberStatus;
        payout_order: number;
        joined_at: Date;
        user: {
            id: string;
            full_name: string;
            phone: string;
            credit_score: number;
        };
    }[]>;
    updateMemberStatus(id: string, memberId: string, user: User, dto: UpdateMemberDto): Promise<{
        message: string;
    }>;
    getCycles(id: string, user: User): Promise<import("../cycles/entities/cycle.entity").Cycle[]>;
}
