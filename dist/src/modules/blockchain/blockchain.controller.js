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
let BlockchainController = class BlockchainController {
    constructor(blockchainService) {
        this.blockchainService = blockchainService;
    }
    async getNetworkStatus() {
        const blockNumber = await this.blockchainService.getBlockNumber();
        return {
            network: 'polygon-mumbai',
            connected: true,
            block_number: blockNumber,
        };
    }
    async getTontineState(contractAddress) {
        return this.blockchainService.getTontineState(contractAddress);
    }
    async verifyProof(contractAddress, cycleNumber, memberAddress) {
        const verified = await this.blockchainService.verifyContributionProof(contractAddress, parseInt(cycleNumber, 10), memberAddress);
        return {
            verified,
            contract_address: contractAddress,
            cycle_number: parseInt(cycleNumber, 10),
            member_address: memberAddress,
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
    (0, common_1.Get)('tontine/:contractAddress'),
    (0, swagger_1.ApiOperation)({ summary: 'État du smart contract d\'une tontine sur Polygon' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Données on-chain retournées' }),
    __param(0, (0, common_1.Param)('contractAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getTontineState", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('contribution/:contractAddress/:cycleNumber/:memberAddress/proof'),
    (0, swagger_1.ApiOperation)({ summary: 'Vérifier une preuve de cotisation on-chain (public)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('contractAddress')),
    __param(1, (0, common_1.Param)('cycleNumber')),
    __param(2, (0, common_1.Param)('memberAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "verifyProof", null);
exports.BlockchainController = BlockchainController = __decorate([
    (0, swagger_1.ApiTags)('Blockchain'),
    (0, common_1.Controller)('blockchain'),
    __metadata("design:paramtypes", [blockchain_service_1.BlockchainService])
], BlockchainController);
//# sourceMappingURL=blockchain.controller.js.map