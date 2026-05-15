import { UsersService } from '../users/users.service';
export declare class ScoreService {
    private readonly usersService;
    private readonly logger;
    constructor(usersService: UsersService);
    addPositiveScore(userId: string): Promise<void>;
    applyPenalty(userId: string): Promise<void>;
}
