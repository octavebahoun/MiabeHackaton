import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { ConfigService } from '@nestjs/config';
export declare class WalletsService {
    private readonly walletRepo;
    private readonly configService;
    constructor(walletRepo: Repository<Wallet>, configService: ConfigService);
    createWalletForUser(userId: string): Promise<Wallet>;
}
