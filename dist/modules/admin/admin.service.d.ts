import { UsersService } from '../users/users.service';
export declare class AdminService {
    private readonly usersService;
    private readonly logger;
    constructor(usersService: UsersService);
    verifyKyc(userId: string): Promise<void>;
    blockUser(userId: string): Promise<void>;
}
