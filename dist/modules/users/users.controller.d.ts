import { UsersService } from './users.service';
import { User } from './entities/user.entity';
declare class UpdateProfileDto {
    full_name?: string;
    email?: string;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(user: User): Promise<any>;
    updateMe(user: User, dto: UpdateProfileDto): Promise<User>;
    getScore(targetId: string, user: User): Promise<{
        user_id: string;
        full_name: string;
        score: number;
        level: string;
        total_contributions: number;
        on_time: number;
        late: number;
        completed_tontines: number;
    }>;
}
export {};
