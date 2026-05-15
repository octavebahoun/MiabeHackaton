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
exports.CyclesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cycles_service_1 = require("./cycles.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let CyclesController = class CyclesController {
    constructor(cyclesService) {
        this.cyclesService = cyclesService;
    }
    async findOne(id) {
        return this.cyclesService.findById(id);
    }
    async getCurrentCycle(tontineId) {
        return this.cyclesService.getCurrentCycle(tontineId);
    }
    async findByTontine(tontineId) {
        return this.cyclesService.findByTontine(tontineId);
    }
};
exports.CyclesController = CyclesController;
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Détail d\'un cycle (bénéficiaire, montants, statut)' }),
    openapi.ApiResponse({ status: 200, type: require("./entities/cycle.entity").Cycle }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CyclesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('tontine/:tontineId/current'),
    (0, swagger_1.ApiOperation)({ summary: 'Cycle actif d\'une tontine' }),
    openapi.ApiResponse({ status: 200, type: require("./entities/cycle.entity").Cycle }),
    __param(0, (0, common_1.Param)('tontineId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CyclesController.prototype, "getCurrentCycle", null);
__decorate([
    (0, common_1.Get)('tontine/:tontineId'),
    (0, swagger_1.ApiOperation)({ summary: 'Tous les cycles d\'une tontine avec leur statut' }),
    openapi.ApiResponse({ status: 200, type: [require("./entities/cycle.entity").Cycle] }),
    __param(0, (0, common_1.Param)('tontineId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CyclesController.prototype, "findByTontine", null);
exports.CyclesController = CyclesController = __decorate([
    (0, swagger_1.ApiTags)('Cycles'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('cycles'),
    __metadata("design:paramtypes", [cycles_service_1.CyclesService])
], CyclesController);
//# sourceMappingURL=cycles.controller.js.map