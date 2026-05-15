"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BlockchainWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainWorker = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const blockchain_service_1 = require("../blockchain.service");
const contribution_entity_1 = require("../../contributions/entities/contribution.entity");
const tontine_entity_1 = require("../../tontines/entities/tontine.entity");
let BlockchainWorker = BlockchainWorker_1 = class BlockchainWorker {
    constructor(blockchainService, contributionRepo, tontineRepo) {
        this.blockchainService = blockchainService;
        this.contributionRepo = contributionRepo;
        this.tontineRepo = tontineRepo;
        this.logger = new common_1.Logger(BlockchainWorker_1.name);
    }
    async handleDeploy(job) {
        const { tontine_id } = job.data;
        this.logger.log(`[deploy-tontine-vault] Démarrage — tontine: ${tontine_id}`);
        try {
            const contractAddress = await this.blockchainService.deployTontineVault(tontine_id);
            await this.tontineRepo.update(tontine_id, { contract_address: contractAddress });
            this.logger.log(`[deploy-tontine-vault] ✅ Succès — adresse: ${contractAddress}`);
            return { contract_address: contractAddress };
        }
        catch (err) {
            this.logger.error(`[deploy-tontine-vault] ❌ Erreur — tontine: ${tontine_id}`, err.message);
            throw err;
        }
    }
    async handleRecord(job) {
        const { contribution_id, cycle_id, member_id, proof_hash } = job.data;
        this.logger.log(`[record-contribution-onchain] Démarrage — contribution: ${contribution_id}`);
        try {
            const contribution = await this.contributionRepo.findOne({
                where: { id: contribution_id },
            });
            if (!contribution) {
                this.logger.warn(`Contribution ${contribution_id} introuvable — job abandonné`);
                return;
            }
            const contractAddress = '';
            if (!contractAddress) {
                this.logger.warn(`Adresse contrat vide pour contribution ${contribution_id} — job différé`);
                throw new Error('CONTRACT_ADDRESS_NOT_YET_AVAILABLE');
            }
            const txHash = await this.blockchainService.recordContributionOnChain({
                contractAddress,
                cycleNumber: 1,
                memberAddress: member_id,
                proofHash: proof_hash,
                contributionId: contribution_id,
            });
            await this.contributionRepo.update(contribution_id, {
                blockchain_confirmed: true,
                blockchain_tx_hash: txHash,
            });
            this.logger.log(`[record-contribution-onchain] ✅ Preuve enregistrée — tx: ${txHash}`);
            return { tx_hash: txHash };
        }
        catch (err) {
            this.logger.error(`[record-contribution-onchain] ❌ Erreur`, err.message);
            if (job.attemptsMade >= (job.opts.attempts ?? 3) - 1) {
                await this.contributionRepo.update(contribution_id, {
                    status: contribution_entity_1.ContributionStatus.BLOCKCHAIN_FAILED,
                });
                this.logger.error(`Contribution ${contribution_id} → BLOCKCHAIN_FAILED après ${job.attemptsMade + 1} tentatives`);
            }
            throw err;
        }
    }
};
exports.BlockchainWorker = BlockchainWorker;
__decorate([
    (0, bull_1.Process)('deploy-tontine-vault'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainWorker.prototype, "handleDeploy", null);
__decorate([
    (0, bull_1.Process)('record-contribution-onchain'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainWorker.prototype, "handleRecord", null);
exports.BlockchainWorker = BlockchainWorker = BlockchainWorker_1 = __decorate([
    (0, bull_1.Processor)('blockchain-queue'),
    __param(1, (0, typeorm_1.InjectRepository)(contribution_entity_1.Contribution)),
    __param(2, (0, typeorm_1.InjectRepository)(tontine_entity_1.Tontine)),
    __metadata("design:paramtypes", [blockchain_service_1.BlockchainService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BlockchainWorker);
//# sourceMappingURL=blockchain.worker.js.map