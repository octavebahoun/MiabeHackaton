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
exports.TontinesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tontines_service_1 = require("./tontines.service");
const cycles_service_1 = require("../cycles/cycles.service");
const create_tontine_dto_1 = require("./dto/create-tontine.dto");
const update_tontine_dto_1 = require("./dto/update-tontine.dto");
const join_tontine_dto_1 = require("./dto/join-tontine.dto");
const update_member_dto_1 = require("./dto/update-member.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let TontinesController = class TontinesController {
    constructor(tontinesService, cyclesService) {
        this.tontinesService = tontinesService;
        this.cyclesService = cyclesService;
    }
    async create(user, dto) {
        return this.tontinesService.create(user.sub, dto);
    }
    async findMyTontines(user) {
        return this.tontinesService.findMyTontines(user.sub);
    }
    async findById(id, user) {
        return this.tontinesService.findById(id, user.sub);
    }
    async update(id, user, dto) {
        return this.tontinesService.update(id, user.sub, dto);
    }
    async open(id, user) {
        return this.tontinesService.open(id, user.sub);
    }
    async start(id, user) {
        return this.tontinesService.start(id, user.sub);
    }
    async join(id, user, dto) {
        return this.tontinesService.join(user.sub, id, dto);
    }
    async getMembers(id, user) {
        return this.tontinesService.getMembers(id, user.sub);
    }
    async updateMemberStatus(id, memberId, user, dto) {
        return this.tontinesService.updateMemberStatus(id, memberId, user.sub, dto.status);
    }
    async getCycles(id, user) {
        await this.tontinesService.findById(id, user.sub);
        return this.cyclesService.findByTontine(id);
    }
};
exports.TontinesController = TontinesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une nouvelle tontine' }),
    openapi.ApiResponse({ status: 201, type: require("./entities/tontine.entity").Tontine }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_tontine_dto_1.CreateTontineDto]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les tontines auxquelles je participe' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "findMyTontines", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Détail d\'une tontine' }),
    openapi.ApiResponse({ status: 200, type: require("./entities/tontine.entity").Tontine }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier une tontine' }),
    openapi.ApiResponse({ status: 200, type: require("./entities/tontine.entity").Tontine }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_tontine_dto_1.UpdateTontineDto]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/open'),
    (0, swagger_1.ApiOperation)({ summary: 'Ouvrir la tontine aux inscriptions (ORGANIZER)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statut passé à OPEN' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "open", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, swagger_1.ApiOperation)({ summary: 'Démarrer la tontine + déploiement smart contract (ORGANIZER)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tontine active, déploiement asynchrone lancé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "start", null);
__decorate([
    (0, common_1.Post)(':id/join'),
    (0, swagger_1.ApiOperation)({ summary: 'Rejoindre une tontine via son code d\'invitation (USER)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Demande envoyée, statut PENDING' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, join_tontine_dto_1.JoinTontineDto]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "join", null);
__decorate([
    (0, common_1.Get)(':id/members'),
    (0, swagger_1.ApiOperation)({ summary: 'Lister tous les membres de la tontine (MEMBER)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "getMembers", null);
__decorate([
    (0, common_1.Patch)(':id/members/:memberId'),
    (0, swagger_1.ApiOperation)({ summary: 'Valider ou rejeter la demande d\'un membre (ORGANIZER)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('memberId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, update_member_dto_1.UpdateMemberDto]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "updateMemberStatus", null);
__decorate([
    (0, common_1.Get)(':id/cycles'),
    (0, swagger_1.ApiOperation)({ summary: 'Tous les cycles d\'une tontine avec leur statut' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste ordonnée des cycles' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TontinesController.prototype, "getCycles", null);
exports.TontinesController = TontinesController = __decorate([
    (0, swagger_1.ApiTags)('Tontines'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('tontines'),
    __metadata("design:paramtypes", [tontines_service_1.TontinesService,
        cycles_service_1.CyclesService])
], TontinesController);
//# sourceMappingURL=tontines.controller.js.map