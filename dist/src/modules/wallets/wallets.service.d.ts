import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Wallet } from './entities/wallet.entity';
import { UsersService } from '../users/users.service';
export declare class WalletsService {
    private readonly walletRepo;
    private readonly configService;
    private readonly usersService;
    constructor(walletRepo: Repository<Wallet>, configService: ConfigService, usersService: UsersService);
    private get encryptionKey();
    private get rpcUrl();
    createWallet(userId: string): Promise<{
        wallet_address: string;
        network: string;
    }>;
    getBalance(userId: string): Promise<{
        wallet_address: string;
        balance_matic: string;
        network: string;
    }>;
    createWalletForUser(userId: string): Promise<Wallet>;
    getDecryptedPrivateKey(userId: string): Promise<string>;
}
