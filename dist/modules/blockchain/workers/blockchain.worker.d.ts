import { Job } from 'bull';
import { Repository } from 'typeorm';
import { BlockchainService } from '../blockchain.service';
import { Contribution } from '../../contributions/entities/contribution.entity';
import { Tontine } from '../../tontines/entities/tontine.entity';
export declare class BlockchainWorker {
    private readonly blockchainService;
    private readonly contributionRepo;
    private readonly tontineRepo;
    private readonly logger;
    constructor(blockchainService: BlockchainService, contributionRepo: Repository<Contribution>, tontineRepo: Repository<Tontine>);
    handleDeploy(job: Job<{
        tontine_id: string;
    }>): Promise<{
        contract_address: string;
    }>;
    handleRecord(job: Job<{
        contribution_id: string;
        cycle_id: string;
        member_id: string;
        amount: number;
        proof_hash: string;
    }>): Promise<{
        tx_hash: string;
    }>;
}
