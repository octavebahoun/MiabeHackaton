import { WalletsService } from './wallets.service';
export declare class WalletsController {
    private readonly walletsService;
    constructor(walletsService: WalletsService);
    create(user: any): Promise<{
        wallet_address: string;
        network: string;
    }>;
    getBalance(user: any): Promise<{
        wallet_address: string;
        balance_matic: string;
        network: string;
    }>;
}
