import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class BlockchainService implements OnModuleInit {
    private readonly config;
    private readonly logger;
    private provider;
    private signer;
    private vaultAbi;
    private registryAbi;
    constructor(config: ConfigService);
    onModuleInit(): void;
    private initProvider;
    private loadAbis;
    getBlockNumber(): Promise<number>;
    deployTontineVault(tontineId: string): Promise<string>;
    private registerInRegistry;
    recordContributionOnChain(params: {
        contractAddress: string;
        cycleNumber: number;
        memberAddress: string;
        proofHash: string;
        contributionId: string;
    }): Promise<string>;
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
    verifyContributionProof(contractAddress: string, cycleNumber: number, memberAddress: string): Promise<boolean>;
    getWalletBalance(walletAddress: string): Promise<string>;
}
