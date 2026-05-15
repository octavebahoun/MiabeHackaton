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
var CyclesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyclesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bull_1 = require("@nestjs/bull");
const cycle_entity_1 = require("./entities/cycle.entity");
const contribution_entity_1 = require("../contributions/entities/contribution.entity");
let CyclesService = CyclesService_1 = class CyclesService {
    constructor(cycleRepo, contributionRepo, notificationsQueue) {
        this.cycleRepo = cycleRepo;
        this.contributionRepo = contributionRepo;
        this.notificationsQueue = notificationsQueue;
        this.logger = new common_1.Logger(CyclesService_1.name);
    }
    async createCycles(params) {
        const { tontineId, confirmedMembers, contributionAmount } = params;
        const ordered = [...confirmedMembers].sort((a, b) => (a.payout_order ?? 999) - (b.payout_order ?? 999));
        const totalMembers = ordered.length;
        const totalExpected = contributionAmount * totalMembers;
        const cycles = [];
        for (let i = 0; i < totalMembers; i++) {
            const cycle = this.cycleRepo.create({
                tontine_id: tontineId,
                cycle_number: i + 1,
                beneficiary_id: ordered[i].user_id,
                status: i === 0 ? cycle_entity_1.CycleStatus.ACTIVE : cycle_entity_1.CycleStatus.PENDING,
                total_expected: totalExpected,
                total_collected: 0,
                starts_at: i === 0 ? new Date() : null,
            });
            cycles.push(cycle);
        }
        const saved = await this.cycleRepo.save(cycles);
        this.logger.log(`${saved.length} cycles créés pour la tontine ${tontineId}`);
        await this.notificationsQueue.add('send-sms', {
            member_id: ordered[0].user_id,
            type: 'CYCLE_STARTED_BENEFICIARY',
        });
        return saved;
    }
    async getCurrentCycle(tontineId) {
        return this.cycleRepo.findOne({
            where: { tontine_id: tontineId, status: cycle_entity_1.CycleStatus.ACTIVE },
            relations: ['beneficiary'],
        });
    }
    async findById(cycleId) {
        const cycle = await this.cycleRepo.findOne({
            where: { id: cycleId },
            relations: ['beneficiary', 'tontine'],
        });
        if (!cycle)
            throw new common_1.NotFoundException('Cycle introuvable');
        return cycle;
    }
    async findByTontine(tontineId) {
        return this.cycleRepo.find({
            where: { tontine_id: tontineId },
            relations: ['beneficiary'],
            order: { cycle_number: 'ASC' },
        });
    }
    async checkCycleCompletion(cycleId) {
        const cycle = await this.cycleRepo.findOne({
            where: { id: cycleId },
            relations: ['tontine'],
        });
        if (!cycle || cycle.status !== cycle_entity_1.CycleStatus.ACTIVE)
            return;
        const confirmedCount = await this.contributionRepo.count({
            where: { cycle_id: cycleId, status: contribution_entity_1.ContributionStatus.CONFIRMED },
        });
        const result = await this.contributionRepo
            .createQueryBuilder('c')
            .select('SUM(c.amount)', 'total')
            .where('c.cycle_id = :cycleId', { cycleId })
            .andWhere('c.status = :status', { status: contribution_entity_1.ContributionStatus.CONFIRMED })
            .getRawOne();
        const totalCollected = parseFloat(result?.total ?? '0');
        await this.cycleRepo.update(cycleId, { total_collected: totalCollected });
        this.logger.log(`Cycle ${cycle.cycle_number} — collecté: ${totalCollected} / attendu: ${cycle.total_expected}`);
        if (totalCollected >= Number(cycle.total_expected)) {
            this.logger.log(`✅ Cycle ${cycle.cycle_number} complet — déclenchement du versement`);
            await this.completeCycleAndAdvance(cycle);
        }
    }
    async completeCycleAndAdvance(cycle) {
        await this.cycleRepo.update(cycle.id, {
            status: cycle_entity_1.CycleStatus.COMPLETED,
            ends_at: new Date(),
        });
        await this.notificationsQueue.add('send-sms', {
            member_id: cycle.beneficiary_id,
            type: 'PAYOUT_INCOMING',
            amount: cycle.total_collected,
        });
        const nextCycle = await this.cycleRepo.findOne({
            where: {
                tontine_id: cycle.tontine_id,
                cycle_number: cycle.cycle_number + 1,
                status: cycle_entity_1.CycleStatus.PENDING,
            },
        });
        if (nextCycle) {
            await this.cycleRepo.update(nextCycle.id, {
                status: cycle_entity_1.CycleStatus.ACTIVE,
                starts_at: new Date(),
            });
            await this.notificationsQueue.add('send-sms', {
                member_id: nextCycle.beneficiary_id,
                type: 'CYCLE_STARTED_BENEFICIARY',
            });
            this.logger.log(`Cycle ${nextCycle.cycle_number} activé pour tontine ${cycle.tontine_id}`);
        }
        else {
            this.logger.log(`🎉 Tontine ${cycle.tontine_id} — tous les cycles terminés !`);
        }
    }
    async updatePayoutTxHash(cycleId, txHash) {
        await this.cycleRepo.update(cycleId, { payout_tx_hash: txHash });
    }
};
exports.CyclesService = CyclesService;
exports.CyclesService = CyclesService = CyclesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cycle_entity_1.Cycle)),
    __param(1, (0, typeorm_1.InjectRepository)(contribution_entity_1.Contribution)),
    __param(2, (0, bull_1.InjectQueue)('notifications-queue')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, Object])
], CyclesService);
//# sourceMappingURL=cycles.service.js.map