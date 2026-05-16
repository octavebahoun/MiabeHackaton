import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private vaultAbi: any[];
  private registryAbi: any[];

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.initProvider();
    this.loadAbis();
  }

  // ──────────────────────────────────────────────
  // INITIALISATION
  // ──────────────────────────────────────────────

  private initProvider() {
    const rpcUrl = this.config.get<string>('POLYGON_RPC_URL', 'https://rpc-amoy.polygon.technology');
    const privateKey = this.config.get<string>('BACKEND_WALLET_PRIVATE_KEY');

    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider);
      this.logger.log(`Wallet backend chargé : ${this.signer.address}`);
    } else {
      this.logger.warn('BACKEND_WALLET_PRIVATE_KEY absent — opérations en lecture seule');
    }
  }

  private loadAbis() {
    try {
      const vaultPath    = path.resolve(__dirname, 'contracts', 'TontineVault.abi.json');
      const registryPath = path.resolve(__dirname, 'contracts', 'TontineRegistry.abi.json');
      this.vaultAbi    = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
      this.registryAbi = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      this.logger.log('ABIs smart contracts chargés');
    } catch (e) {
      this.logger.warn('ABIs introuvables — lancer hardhat compile puis relancer le serveur');
      this.vaultAbi    = [];
      this.registryAbi = [];
    }
  }

  // ──────────────────────────────────────────────
  // PROVIDER avec FAILOVER (QuickNode → Alchemy → public RPC)
  // ──────────────────────────────────────────────

  async getBlockNumber(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (e) {
      this.logger.error('Erreur provider principal', e.message);
      // Failover vers RPC public
      const fallbackProvider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
      return fallbackProvider.getBlockNumber();
    }
  }

  // ──────────────────────────────────────────────
  // DÉPLOIEMENT DE TontineVault.sol
  // ──────────────────────────────────────────────

  async deployTontineVault(tontineId: string): Promise<string> {
    if (!this.signer) throw new Error('Signer non configuré');

    const bytecodeHex = this.config.get<string>('TONTINE_VAULT_BYTECODE', '');
    if (!bytecodeHex) {
      throw new Error('TONTINE_VAULT_BYTECODE absent du .env — compiler les contrats avec hardhat compile');
    }

    this.logger.log(`Déploiement TontineVault pour tontine ${tontineId}...`);

    const factory = new ethers.ContractFactory(this.vaultAbi, bytecodeHex, this.signer);
    const contract = await factory.deploy(tontineId);
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    this.logger.log(`TontineVault déployé à l'adresse : ${address}`);

    // Enregistrement dans le TontineRegistry
    await this.registerInRegistry(tontineId, address);

    return address;
  }

  private async registerInRegistry(tontineId: string, vaultAddress: string): Promise<void> {
    const registryAddress = this.config.get<string>('REGISTRY_CONTRACT_ADDRESS');
    if (!registryAddress || this.registryAbi.length === 0) {
      this.logger.warn('TontineRegistry non configuré — enregistrement ignoré');
      return;
    }
    const registry = new ethers.Contract(registryAddress, this.registryAbi, this.signer);
    const tontineIdBytes32 = ethers.id(tontineId); // keccak256(tontineId)
    const tx = await registry.register(tontineIdBytes32, vaultAddress);
    await tx.wait();
    this.logger.log(`Tontine ${tontineId} enregistrée dans le Registry`);
  }

  // ──────────────────────────────────────────────
  // ENREGISTREMENT D'UNE PREUVE ON-CHAIN
  // ──────────────────────────────────────────────

  async recordContributionOnChain(params: {
    contractAddress: string;
    cycleNumber: number;
    memberAddress: string;
    proofHash: string;
    contributionId: string;
  }): Promise<string> {
    if (!this.signer) throw new Error('Signer non configuré');
    if (this.vaultAbi.length === 0) throw new Error('ABI TontineVault non chargé');

    this.logger.log(`Enregistrement preuve on-chain — contribution: ${params.contributionId}`);

    const vault = new ethers.Contract(params.contractAddress, this.vaultAbi, this.signer);
    const proofBytes32 = `0x${params.proofHash.slice(0, 64)}`; // Format bytes32

    // Estimation du gas avec marge de +20%
    const gasEstimate = await vault.recordContribution.estimateGas(
      params.cycleNumber,
      params.memberAddress,
      proofBytes32,
    );
    const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100);

    const tx = await vault.recordContribution(
      params.cycleNumber,
      params.memberAddress,
      proofBytes32,
      { gasLimit },
    );

    // Attente de confirmation (timeout 3 minutes)
    const receipt = await Promise.race([
      tx.wait(1),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout confirmation blockchain')), 180_000),
      ),
    ]);

    this.logger.log(`Preuve enregistrée — tx: ${receipt.hash}`);
    return receipt.hash as string;
  }

  // ──────────────────────────────────────────────
  // LECTURE ON-CHAIN
  // ──────────────────────────────────────────────

  async getTontineState(contractAddress: string) {
    if (this.vaultAbi.length === 0) return { error: 'ABI non chargé' };
    const vault = new ethers.Contract(contractAddress, this.vaultAbi, this.provider);
    try {
      const [cycleNumber, totalContributions] = await Promise.all([
        vault.currentCycle(),
        vault.totalContributions(),
      ]);
      return {
        contract_address: contractAddress,
        current_cycle: Number(cycleNumber),
        total_contributions_recorded: Number(totalContributions),
        network: this.config.get('POLYGON_NETWORK', 'polygon-mumbai'),
      };
    } catch (e) {
      return { error: `Impossible de lire le contrat: ${e.message}` };
    }
  }

  async verifyContributionProof(contractAddress: string, cycleNumber: number, memberAddress: string): Promise<boolean> {
    if (this.vaultAbi.length === 0) return false;
    const vault = new ethers.Contract(contractAddress, this.vaultAbi, this.provider);
    try {
      return await vault.isContributionRecorded(cycleNumber, memberAddress);
    } catch {
      return false;
    }
  }

  async getWalletBalance(walletAddress: string): Promise<string> {
    const balance = await this.provider.getBalance(walletAddress);
    return ethers.formatEther(balance); // Retourne en MATIC (ETH-like)
  }
}
