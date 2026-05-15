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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const blockchain_service_1 = require("./blockchain.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tontine_entity_1 = require("../tontines/entities/tontine.entity");
const common_2 = require("@nestjs/common");
const contribution_entity_1 = require("../contributions/entities/contribution.entity");
let BlockchainController = class BlockchainController {
    constructor(blockchainService, tontineRepo, contributionRepo) {
        this.blockchainService = blockchainService;
        this.tontineRepo = tontineRepo;
        this.contributionRepo = contributionRepo;
    }
    async getNetworkStatus() {
        const blockNumber = await this.blockchainService.getBlockNumber();
        return { network: 'polygon-mumbai', connected: true, block_number: blockNumber };
    }
    async getTontineState(tontineId) {
        const tontine = await this.tontineRepo.findOne({ where: { id: tontineId } });
        if (!tontine)
            throw new common_2.NotFoundException('Tontine introuvable');
        if (!tontine.contract_address) {
            return { tontine_id: tontineId, status: 'CONTRACT_NOT_DEPLOYED', message: 'Le smart contract n\'a pas encore été déployé' };
        }
        return this.blockchainService.getTontineState(tontine.contract_address);
    }
    async verifyContributionProof(contributionId) {
        const contribution = await this.contributionRepo.findOne({ where: { id: contributionId } });
        if (!contribution)
            throw new common_2.NotFoundException('Contribution introuvable');
        return {
            contribution_id: contributionId,
            blockchain_confirmed: contribution.blockchain_confirmed,
            blockchain_tx_hash: contribution.blockchain_tx_hash,
            proof_hash: contribution.proof_hash,
            verified: contribution.blockchain_confirmed && !!contribution.blockchain_tx_hash,
        };
    }
};
exports.BlockchainController = BlockchainController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Statut de la connexion au réseau Polygon' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getNetworkStatus", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('tontine/:tontineId'),
    (0, swagger_1.ApiOperation)({ summary: 'État on-chain du smart contract d\'une tontine (MEMBER)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Données blockchain retournées' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tontine ou contrat introuvable' }),
    __param(0, (0, common_1.Param)('tontineId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getTontineState", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('contribution/:id/proof'),
    (0, swagger_1.ApiOperation)({ summary: 'Vérifier une preuve de cotisation on-chain (JWT)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '{ verified, tx_hash, proof_hash }' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "verifyContributionProof", null);
exports.BlockchainController = BlockchainController = __decorate([
    (0, swagger_1.ApiTags)('Blockchain'),
    (0, common_1.Controller)('blockchain'),
    __param(1, (0, typeorm_1.InjectRepository)(tontine_entity_1.Tontine)),
    __param(2, (0, typeorm_1.InjectRepository)(contribution_entity_1.Contribution)),
    __metadata("design:paramtypes", [blockchain_service_1.BlockchainService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BlockchainController);
//# sourceMappingURL=blockchain.controller.js.map