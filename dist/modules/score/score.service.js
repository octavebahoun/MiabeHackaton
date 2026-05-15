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
var ScoreService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoreService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
let ScoreService = ScoreService_1 = class ScoreService {
    constructor(usersService) {
        this.usersService = usersService;
        this.logger = new common_1.Logger(ScoreService_1.name);
    }
    async addPositiveScore(userId) {
        this.logger.log(`Ajout de points positifs pour l'utilisateur ${userId}`);
        try {
            const user = await this.usersService.findById(userId);
            const currentScore = user.credit_score || 500;
            const newScore = Math.min(1000, currentScore + 5);
            await this.usersService.updateCreditScore(userId, newScore);
            this.logger.log(`Nouveau score calculé : ${newScore}`);
        }
        catch (e) {
            this.logger.error(`Erreur maj score : ${e.message}`);
        }
    }
    async applyPenalty(userId) {
        this.logger.warn(`Pénalité appliquée au score de l'utilisateur ${userId}`);
        try {
            const user = await this.usersService.findById(userId);
            const currentScore = user.credit_score || 500;
            const newScore = Math.max(0, currentScore - 20);
            await this.usersService.updateCreditScore(userId, newScore);
            this.logger.log(`Nouveau score suite à pénalité : ${newScore}`);
        }
        catch (e) {
            this.logger.error(`Erreur pénalité score : ${e.message}`);
        }
    }
};
exports.ScoreService = ScoreService;
exports.ScoreService = ScoreService = ScoreService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], ScoreService);
//# sourceMappingURL=score.service.js.map