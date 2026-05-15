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
var SanctionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanctionsService = void 0;
const common_1 = require("@nestjs/common");
const score_service_1 = require("../score/score.service");
const notifications_service_1 = require("../notifications/notifications.service");
let SanctionsService = SanctionsService_1 = class SanctionsService {
    constructor(scoreService, notificationsService) {
        this.scoreService = scoreService;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(SanctionsService_1.name);
    }
    async processLatePayments(tontineId, cycleNumber, lateUserIds) {
        this.logger.log(`Traitement des retards pour tontine ${tontineId}, cycle ${cycleNumber}`);
        for (const userId of lateUserIds) {
            await this.scoreService.applyPenalty(userId);
            await this.notificationsService.queuePush({
                token: 'user_fcm_token_placeholder',
                title: '⚠️ Retard de Cotisation',
                body: `Vous n'avez pas cotisé à temps pour le cycle ${cycleNumber}. Votre score de crédit a été pénalisé.`,
            });
            this.logger.log(`Utilisateur ${userId} sanctionné pour retard`);
        }
    }
};
exports.SanctionsService = SanctionsService;
exports.SanctionsService = SanctionsService = SanctionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [score_service_1.ScoreService,
        notifications_service_1.NotificationsService])
], SanctionsService);
//# sourceMappingURL=sanctions.service.js.map