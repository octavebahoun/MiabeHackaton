import { TontinesRepository } from './tontines.repository';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';
import { JoinTontineDto } from './dto/join-tontine.dto';
import { MemberRole, MemberStatus } from './entities/tontine-member.entity';
import { TontineStatus } from './entities/tontine.entity';
import { CyclesService } from '../cycles/cycles.service';
export declare class TontinesService {
    private readonly repository;
    private readonly cyclesService;
    constructor(repository: TontinesRepository, cyclesService: CyclesService);
    private generateInvitationCode;
    create(userId: string, dto: CreateTontineDto): Promise<import("./entities/tontine.entity").Tontine>;
    findMyTontines(userId: string): Promise<{
        my_role: MemberRole;
        my_status: MemberStatus;
        current_cycle: import("../cycles/entities/cycle.entity").Cycle;
        my_contribution_status: string;
        id: string;
        name: string;
        organizer_id: string;
        organizer: import("../users/entities/user.entity").User;
        contribution_amount: number;
        frequency: import("./entities/tontine.entity").TontineFrequency;
        max_members: number;
        status: TontineStatus;
        invitation_code: string;
        contract_address: string;
        start_date: Date;
        members: import("./entities/tontine-member.entity").TontineMember[];
        created_at: Date;
        updated_at: Date;
    }[]>;
    findById(tontineId: string, userId: string): Promise<import("./entities/tontine.entity").Tontine>;
    update(tontineId: string, userId: string, dto: UpdateTontineDto): Promise<import("./entities/tontine.entity").Tontine>;
    open(tontineId: string, userId: string): Promise<{
        message: string;
    }>;
    start(tontineId: string, userId: string): Promise<{
        message: string;
    }>;
    join(userId: string, tontineId: string, dto: JoinTontineDto): Promise<{
        message: string;
    }>;
    getMembers(tontineId: string, userId: string): Promise<{
        id: string;
        role: MemberRole;
        status: MemberStatus;
        payout_order: number;
        joined_at: Date;
        user: {
            id: string;
            full_name: string;
            phone: string;
            credit_score: number;
        };
    }[]>;
    updateMemberStatus(tontineId: string, memberId: string, userId: string, status: MemberStatus): Promise<{
        message: string;
    }>;
}
