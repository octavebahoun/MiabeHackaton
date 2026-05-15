import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    verifyKyc(userId: string): Promise<{
        message: string;
    }>;
    blockUser(userId: string): Promise<{
        message: string;
    }>;
}
