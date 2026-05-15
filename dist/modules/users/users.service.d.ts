import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: UsersRepository);
    findByPhone(phone: string): Promise<User | null>;
    findById(id: string): Promise<User>;
    create(data: Partial<User>): Promise<User>;
    activate(id: string): Promise<void>;
    updateWallet(id: string, walletAddress: string): Promise<void>;
    updateProfile(id: string, data: {
        full_name?: string;
        email?: string;
    }): Promise<User>;
    updateCreditScore(id: string, score: number): Promise<void>;
    updateKycStatus(id: string, status: any): Promise<void>;
    blockUser(id: string): Promise<void>;
    getScoreById(requesterId: string, targetUserId: string): Promise<{
        user_id: string;
        full_name: string;
        credit_score: number;
        score_label: string;
    }>;
}
