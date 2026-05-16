"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BlockchainService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ethers_1 = require("ethers");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let BlockchainService = BlockchainService_1 = class BlockchainService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(BlockchainService_1.name);
    }
    onModuleInit() {
        this.initProvider();
        this.loadAbis();
    }
    initProvider() {
        const rpcUrl = this.config.get('POLYGON_RPC_URL', 'https://rpc-amoy.polygon.technology');
        const privateKey = this.config.get('BACKEND_WALLET_PRIVATE_KEY');
        this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        if (privateKey) {
            this.signer = new ethers_1.ethers.Wallet(privateKey, this.provider);
            this.logger.log(`Wallet backend chargé : ${this.signer.address}`);
        }
        else {
            this.logger.warn('BACKEND_WALLET_PRIVATE_KEY absent — opérations en lecture seule');
        }
    }
    loadAbis() {
        try {
            const vaultPath = path.resolve(__dirname, 'contracts', 'TontineVault.abi.json');
            const registryPath = path.resolve(__dirname, 'contracts', 'TontineRegistry.abi.json');
            this.vaultAbi = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
            this.registryAbi = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
            this.logger.log('ABIs smart contracts chargés');
        }
        catch (e) {
            this.logger.warn('ABIs introuvables — lancer hardhat compile puis relancer le serveur');
            this.vaultAbi = [];
            this.registryAbi = [];
        }
    }
    async getBlockNumber() {
        try {
            return await this.provider.getBlockNumber();
        }
        catch (e) {
            this.logger.error('Erreur provider principal', e.message);
            const fallbackProvider = new ethers_1.ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
            return fallbackProvider.getBlockNumber();
        }
    }
    async deployTontineVault(tontineId) {
        if (!this.signer)
            throw new Error('Signer non configuré');
        const bytecodeHex = this.config.get('TONTINE_VAULT_BYTECODE', '');
        if (!bytecodeHex) {
            throw new Error('TONTINE_VAULT_BYTECODE absent du .env — compiler les contrats avec hardhat compile');
        }
        this.logger.log(`Déploiement TontineVault pour tontine ${tontineId}...`);
        const factory = new ethers_1.ethers.ContractFactory(this.vaultAbi, bytecodeHex, this.signer);
        const contract = await factory.deploy(tontineId);
        await contract.waitForDeployment();
        const address = await contract.getAddress();
        this.logger.log(`TontineVault déployé à l'adresse : ${address}`);
        await this.registerInRegistry(tontineId, address);
        return address;
    }
    async registerInRegistry(tontineId, vaultAddress) {
        const registryAddress = this.config.get('REGISTRY_CONTRACT_ADDRESS');
        if (!registryAddress || this.registryAbi.length === 0) {
            this.logger.warn('TontineRegistry non configuré — enregistrement ignoré');
            return;
        }
        const registry = new ethers_1.ethers.Contract(registryAddress, this.registryAbi, this.signer);
        const tontineIdBytes32 = ethers_1.ethers.id(tontineId);
        const tx = await registry.register(tontineIdBytes32, vaultAddress);
        await tx.wait();
        this.logger.log(`Tontine ${tontineId} enregistrée dans le Registry`);
    }
    async recordContributionOnChain(params) {
        if (!this.signer)
            throw new Error('Signer non configuré');
        if (this.vaultAbi.length === 0)
            throw new Error('ABI TontineVault non chargé');
        this.logger.log(`Enregistrement preuve on-chain — contribution: ${params.contributionId}`);
        const vault = new ethers_1.ethers.Contract(params.contractAddress, this.vaultAbi, this.signer);
        const proofBytes32 = `0x${params.proofHash.slice(0, 64)}`;
        const gasEstimate = await vault.recordContribution.estimateGas(params.cycleNumber, params.memberAddress, proofBytes32);
        const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100);
        const tx = await vault.recordContribution(params.cycleNumber, params.memberAddress, proofBytes32, { gasLimit });
        const receipt = await Promise.race([
            tx.wait(1),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout confirmation blockchain')), 180_000)),
        ]);
        this.logger.log(`Preuve enregistrée — tx: ${receipt.hash}`);
        return receipt.hash;
    }
    async getTontineState(contractAddress) {
        if (this.vaultAbi.length === 0)
            return { error: 'ABI non chargé' };
        const vault = new ethers_1.ethers.Contract(contractAddress, this.vaultAbi, this.provider);
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
        }
        catch (e) {
            return { error: `Impossible de lire le contrat: ${e.message}` };
        }
    }
    async verifyContributionProof(contractAddress, cycleNumber, memberAddress) {
        if (this.vaultAbi.length === 0)
            return false;
        const vault = new ethers_1.ethers.Contract(contractAddress, this.vaultAbi, this.provider);
        try {
            return await vault.isContributionRecorded(cycleNumber, memberAddress);
        }
        catch {
            return false;
        }
    }
    async getWalletBalance(walletAddress) {
        const balance = await this.provider.getBalance(walletAddress);
        return ethers_1.ethers.formatEther(balance);
    }
};
exports.BlockchainService = BlockchainService;
exports.BlockchainService = BlockchainService = BlockchainService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BlockchainService);
//# sourceMappingURL=blockchain.service.js.map