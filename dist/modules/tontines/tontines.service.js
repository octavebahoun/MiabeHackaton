"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TontinesService = void 0;
const common_1 = require("@nestjs/common");
const tontines_repository_1 = require("./tontines.repository");
const tontine_member_entity_1 = require("./entities/tontine-member.entity");
const tontine_entity_1 = require("./entities/tontine.entity");
const cycles_service_1 = require("../cycles/cycles.service");
const crypto = __importStar(require("crypto"));
let TontinesService = class TontinesService {
    constructor(repository, cyclesService) {
        this.repository = repository;
        this.cyclesService = cyclesService;
    }
    generateInvitationCode() {
        return crypto.randomBytes(4).toString('hex').toUpperCase();
    }
    async create(userId, dto) {
        const code = this.generateInvitationCode();
        const tontine = this.repository.tontineRepo.create({
            ...dto,
            organizer_id: userId,
            invitation_code: code,
            status: tontine_entity_1.TontineStatus.DRAFT,
        });
        const savedTontine = await this.repository.tontineRepo.save(tontine);
        const member = this.repository.memberRepo.create({
            tontine_id: savedTontine.id,
            user_id: userId,
            role: tontine_member_entity_1.MemberRole.ORGANIZER,
            status: tontine_member_entity_1.MemberStatus.CONFIRMED,
            payout_order: 1,
        });
        await this.repository.memberRepo.save(member);
        return savedTontine;
    }
    async findMyTontines(userId) {
        const memberships = await this.repository.memberRepo.find({
            where: { user_id: userId },
            relations: ['tontine'],
        });
        return memberships.map(m => m.tontine);
    }
    async findById(tontineId, userId) {
        const tontine = await this.repository.tontineRepo.findOne({
            where: { id: tontineId },
            relations: ['members', 'members.user'],
        });
        if (!tontine)
            throw new common_1.NotFoundException('Tontine introuvable');
        if (!tontine.members.some(m => m.user_id === userId)) {
            throw new common_1.ForbiddenException('Vous ne faites pas partie de cette tontine');
        }
        return tontine;
    }
    async update(tontineId, userId, dto) {
        const tontine = await this.repository.tontineRepo.findOne({ where: { id: tontineId } });
        if (!tontine)
            throw new common_1.NotFoundException('Tontine introuvable');
        if (tontine.organizer_id !== userId)
            throw new common_1.ForbiddenException('Seul l\'organisateur peut modifier la tontine');
        if (tontine.status !== tontine_entity_1.TontineStatus.DRAFT)
            throw new common_1.ConflictException('Impossible de modifier, statut brouillon requis');
        await this.repository.tontineRepo.update(tontineId, dto);
        return this.repository.tontineRepo.findOne({ where: { id: tontineId } });
    }
    async open(tontineId, userId) {
        const tontine = await this.repository.tontineRepo.findOne({ where: { id: tontineId } });
        if (!tontine)
            throw new common_1.NotFoundException('Tontine introuvable');
        if (tontine.organizer_id !== userId)
            throw new common_1.ForbiddenException('Seul l\'organisateur peut ouvrir la tontine');
        if (tontine.status !== tontine_entity_1.TontineStatus.DRAFT)
            throw new common_1.ConflictException('La tontine doit être en DRAFT pour l\'ouvrir');
        await this.repository.tontineRepo.update(tontineId, { status: tontine_entity_1.TontineStatus.OPEN });
        return { message: 'Tontine ouverte aux inscriptions ! Les membres peuvent maintenant rejoindre.' };
    }
    async start(tontineId, userId) {
        const tontine = await this.repository.tontineRepo.findOne({
            where: { id: tontineId },
            relations: ['members']
        });
        if (!tontine)
            throw new common_1.NotFoundException('Tontine introuvable');
        if (tontine.organizer_id !== userId)
            throw new common_1.ForbiddenException('Seul l\'organisateur peut démarrer la tontine');
        if (tontine.status !== tontine_entity_1.TontineStatus.OPEN)
            throw new common_1.ConflictException('La tontine doit être OPEN pour démarrer');
        const confirmedMembers = tontine.members.filter(m => m.status === tontine_member_entity_1.MemberStatus.CONFIRMED);
        if (confirmedMembers.length < 2) {
            throw new common_1.BadRequestException('Il faut au moins 2 membres confirmés pour démarrer la tontine');
        }
        await this.repository.tontineRepo.update(tontineId, {
            status: tontine_entity_1.TontineStatus.ACTIVE,
            start_date: new Date()
        });
        await this.cyclesService.createCycles({
            tontineId,
            confirmedMembers,
            contributionAmount: Number(tontine.contribution_amount),
        });
        return {
            message: 'Tontine démarrée avec succès. Déploiement du smart contract sur Polygon en cours...'
        };
    }
    async join(userId, tontineId, dto) {
        const tontine = await this.repository.tontineRepo.findOne({
            where: { id: tontineId },
            relations: ['members']
        });
        if (!tontine)
            throw new common_1.NotFoundException('Tontine introuvable');
        if (tontine.invitation_code !== dto.invitation_code) {
            throw new common_1.BadRequestException('Code d\'invitation invalide pour cette tontine');
        }
        if (tontine.status !== tontine_entity_1.TontineStatus.OPEN) {
            throw new common_1.ConflictException('Cette tontine n\'accepte pas d\'inscriptions pour le moment');
        }
        if (tontine.members.length >= tontine.max_members) {
            throw new common_1.ConflictException('La tontine a déjà atteint son nombre maximum de membres');
        }
        if (tontine.members.some(m => m.user_id === userId)) {
            throw new common_1.ConflictException('Vous avez déjà soumis une demande pour cette tontine');
        }
        const member = this.repository.memberRepo.create({
            tontine_id: tontine.id,
            user_id: userId,
            role: tontine_member_entity_1.MemberRole.MEMBER,
            status: tontine_member_entity_1.MemberStatus.PENDING,
        });
        await this.repository.memberRepo.save(member);
        return { message: 'Demande d\'adhésion envoyée avec succès à l\'organisateur.' };
    }
    async getMembers(tontineId, userId) {
        const tontine = await this.repository.tontineRepo.findOne({
            where: { id: tontineId },
            relations: ['members', 'members.user']
        });
        if (!tontine)
            throw new common_1.NotFoundException('Tontine introuvable');
        if (!tontine.members.some(m => m.user_id === userId)) {
            throw new common_1.ForbiddenException('Vous ne faites pas partie de cette tontine');
        }
        return tontine.members.map(m => ({
            id: m.id,
            role: m.role,
            status: m.status,
            payout_order: m.payout_order,
            joined_at: m.joined_at,
            user: {
                id: m.user.id,
                full_name: m.user.full_name,
                phone: m.user.phone,
                credit_score: m.user.credit_score
            }
        }));
    }
    async updateMemberStatus(tontineId, memberId, userId, status) {
        const tontine = await this.repository.tontineRepo.findOne({ where: { id: tontineId } });
        if (!tontine)
            throw new common_1.NotFoundException('Tontine introuvable');
        if (tontine.organizer_id !== userId)
            throw new common_1.ForbiddenException('Seul l\'organisateur peut valider les membres');
        if (tontine.status !== tontine_entity_1.TontineStatus.OPEN)
            throw new common_1.ConflictException('Les inscriptions sont fermées');
        const member = await this.repository.memberRepo.findOne({ where: { id: memberId, tontine_id: tontineId } });
        if (!member)
            throw new common_1.NotFoundException('Membre introuvable');
        if (member.role === tontine_member_entity_1.MemberRole.ORGANIZER)
            throw new common_1.ConflictException('Impossible de modifier le statut de l\'organisateur lui-même');
        await this.repository.memberRepo.update(memberId, { status });
        return { message: `Statut du membre mis à jour : ${status}` };
    }
};
exports.TontinesService = TontinesService;
exports.TontinesService = TontinesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => cycles_service_1.CyclesService))),
    __metadata("design:paramtypes", [tontines_repository_1.TontinesRepository,
        cycles_service_1.CyclesService])
], TontinesService);
//# sourceMappingURL=tontines.service.js.map