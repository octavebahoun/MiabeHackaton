import { BlockchainService } from './blockchain.service';
import { Repository } from 'typeorm';
import { Tontine } from '../tontines/entities/tontine.entity';
import { Contribution } from '../contributions/entities/contribution.entity';
export declare class BlockchainController {
    private readonly blockchainService;
    private readonly tontineRepo;
    private readonly contributionRepo;
    constructor(blockchainService: BlockchainService, tontineRepo: Repository<Tontine>, contributionRepo: Repository<Contribution>);
    getNetworkStatus(): Promise<{
        network: string;
        connected: boolean;
        block_number: number;
    }>;
    getTontineState(tontineId: string): Promise<{
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
    } | {
        tontine_id: string;
        status: string;
        message: string;
    }>;
    verifyContributionProof(contributionId: string): Promise<{
        contribution_id: string;
        blockchain_confirmed: boolean;
        blockchain_tx_hash: string;
        proof_hash: string;
        verified: boolean;
    }>;
}
