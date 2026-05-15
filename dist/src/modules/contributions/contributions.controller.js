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
exports.ContributionsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const contributions_service_1 = require("./contributions.service");
const initiate_contribution_dto_1 = require("./dto/initiate-contribution.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let ContributionsController = class ContributionsController {
    constructor(contributionsService) {
        this.contributionsService = contributionsService;
    }
    async initiate(user, dto) {
        const cycleStub = {
            id: dto.cycle_id,
            tontine_id: 'stub',
            status: 'ACTIVE',
            contribution_amount: 50_000,
        };
        return this.contributionsService.initiate(user.sub, dto, cycleStub);
    }
    async cinetpayWebhook(payload, clientIp) {
        await this.contributionsService.handleCinetPayWebhook(payload, clientIp);
        return { code: '00', message: 'OK' };
    }
    async findByCycle(cycleId) {
        return this.contributionsService.findByCycle(cycleId);
    }
    async findMyHistory(user) {
        return this.contributionsService.findMyHistory(user.sub);
    }
};
exports.ContributionsController = ContributionsController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('initiate'),
    (0, swagger_1.ApiOperation)({ summary: 'Initier un paiement de cotisation (MTN MoMo / Moov Money)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Intention de paiement créée, lien CinetPay retourné' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, initiate_contribution_dto_1.InitiateContributionDto]),
    __metadata("design:returntype", Promise)
], ContributionsController.prototype, "initiate", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('webhook/cinetpay'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Webhook CinetPay (signature HMAC + IP whitelist)' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.OK }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ContributionsController.prototype, "cinetpayWebhook", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('cycle/:cycleId'),
    (0, swagger_1.ApiOperation)({ summary: 'Cotisations d\'un cycle donné' }),
    openapi.ApiResponse({ status: 200, type: [require("./entities/contribution.entity").Contribution] }),
    __param(0, (0, common_1.Param)('cycleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContributionsController.prototype, "findByCycle", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Mon historique de cotisations' }),
    openapi.ApiResponse({ status: 200, type: [require("./entities/contribution.entity").Contribution] }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContributionsController.prototype, "findMyHistory", null);
exports.ContributionsController = ContributionsController = __decorate([
    (0, swagger_1.ApiTags)('Contributions'),
    (0, common_1.Controller)('contributions'),
    __metadata("design:paramtypes", [contributions_service_1.ContributionsService])
], ContributionsController);
//# sourceMappingURL=contributions.controller.js.map