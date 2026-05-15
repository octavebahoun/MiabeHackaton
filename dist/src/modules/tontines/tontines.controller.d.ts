import { TontinesService } from './tontines.service';
import { CyclesService } from '../cycles/cycles.service';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';
import { JoinTontineDto } from './dto/join-tontine.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
export declare class TontinesController {
    private readonly tontinesService;
    private readonly cyclesService;
    constructor(tontinesService: TontinesService, cyclesService: CyclesService);
    create(user: any, dto: CreateTontineDto): Promise<import("./entities/tontine.entity").Tontine>;
    findMyTontines(user: any): Promise<import("./entities/tontine.entity").Tontine[]>;
    findById(id: string, user: any): Promise<import("./entities/tontine.entity").Tontine>;
    update(id: string, user: any, dto: UpdateTontineDto): Promise<import("./entities/tontine.entity").Tontine>;
    open(id: string, user: any): Promise<{
        message: string;
    }>;
    start(id: string, user: any): Promise<{
        message: string;
    }>;
    join(id: string, user: any, dto: JoinTontineDto): Promise<{
        message: string;
    }>;
    getMembers(id: string, user: any): Promise<{
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
    updateMemberStatus(id: string, memberId: string, user: any, dto: UpdateMemberDto): Promise<{
        message: string;
    }>;
}
