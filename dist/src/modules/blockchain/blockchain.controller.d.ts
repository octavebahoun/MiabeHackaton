import { BlockchainService } from './blockchain.service';
export declare class BlockchainController {
    private readonly blockchainService;
    constructor(blockchainService: BlockchainService);
    getNetworkStatus(): Promise<{
        network: string;
        connected: boolean;
        block_number: number;
    }>;
    getTontineState(contractAddress: string): Promise<{
        error: string;
        contract_address?: undefined;
        current_cycle?: undefined;
        total_contributions_recorded?: undefined;
        network?: undefined;
    } | {
        contract_address: string;
        current_cycle: number;
        total_contributions_recorded: number;
        network: any;
        error?: undefined;
    }>;
    verifyProof(contractAddress: string, cycleNumber: string, memberAddress: string): Promise<{
        verified: boolean;
        contract_address: string;
        cycle_number: number;
        member_address: string;
    }>;
}
