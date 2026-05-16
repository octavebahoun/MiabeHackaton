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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const users_repository_1 = require("./users.repository");
let UsersService = class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async findByPhone(phone) {
        return this.usersRepository.findByPhone(phone);
    }
    async findById(id) {
        const user = await this.usersRepository.findById(id);
        if (!user)
            throw new common_1.NotFoundException('USER_NOT_FOUND');
        return user;
    }
    async create(data) {
        return this.usersRepository.create(data);
    }
    async activate(id) {
        await this.usersRepository.updateById(id, {
            is_active: true,
            phone_verified: true,
        });
    }
    async updateWallet(id, walletAddress) {
        await this.usersRepository.updateById(id, { wallet_address: walletAddress });
    }
    async updateProfile(id, data) {
        await this.usersRepository.updateById(id, data);
        return this.findById(id);
    }
    async updateCreditScore(id, score) {
        await this.usersRepository.updateById(id, { credit_score: score });
    }
    async updateKycStatus(id, status) {
        await this.usersRepository.updateById(id, { kyc_status: status });
    }
    async blockUser(id) {
        await this.usersRepository.updateById(id, { is_active: false });
    }
    async getScoreById(userId, targetUserId) {
        const target = await this.findById(targetUserId);
        let score_label;
        const score = Number(target.credit_score ?? 0);
        if (score >= 90)
            score_label = 'Excellent';
        else if (score >= 70)
            score_label = 'Bon';
        else if (score >= 50)
            score_label = 'Moyen';
        else if (score >= 30)
            score_label = 'Faible';
        else
            score_label = 'Très faible';
        return {
            user_id: target.id,
            full_name: target.full_name,
            score: score,
            level: score_label.toUpperCase(),
            total_contributions: 0,
            on_time: 0,
            late: 0,
            completed_tontines: 0,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository])
], UsersService);
//# sourceMappingURL=users.service.js.map