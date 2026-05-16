import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { TontinesRepository } from './tontines.repository';
import { CreateTontineDto } from './dto/create-tontine.dto';
import { UpdateTontineDto } from './dto/update-tontine.dto';
import { JoinTontineDto } from './dto/join-tontine.dto';
import { MemberRole, MemberStatus } from './entities/tontine-member.entity';
import { TontineStatus } from './entities/tontine.entity';
import { CyclesService } from '../cycles/cycles.service';
import * as crypto from 'crypto';

import { Contribution, ContributionStatus } from '../contributions/entities/contribution.entity';

@Injectable()
export class TontinesService {
  constructor(
    private readonly repository: TontinesRepository,
    @Inject(forwardRef(() => CyclesService))
    private readonly cyclesService: CyclesService,
  ) {}

  private generateInvitationCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase(); // ex: 8E7A3F2B
  }

  // --- 1. CRÉATION & LECTURE DE BASE ---

  async create(userId: string, dto: CreateTontineDto) {
    const code = this.generateInvitationCode();
    const tontine = this.repository.tontineRepo.create({
      ...dto,
      organizer_id: userId,
      invitation_code: code,
      status: TontineStatus.DRAFT,
    });
    const savedTontine = await this.repository.tontineRepo.save(tontine);
    const member = this.repository.memberRepo.create({
      tontine_id: savedTontine.id,
      user_id: userId,
      role: MemberRole.ORGANIZER,
      status: MemberStatus.CONFIRMED,
      payout_order: 1,
    });
    await this.repository.memberRepo.save(member);
    return savedTontine;
  }

  async findMyTontines(userId: string) {
    const memberships = await this.repository.memberRepo.find({
      where: { user_id: userId },
      relations: ['tontine'],
    });

    const result = await Promise.all(memberships.map(async (m) => {
      const tontine = m.tontine;
      const currentCycle = await this.cyclesService.getCurrentCycle(tontine.id);
      
      let my_contribution_status = 'NONE';
      if (currentCycle) {
        const contribution = await this.repository.tontineRepo.manager.findOne(Contribution, {
          where: { cycle_id: currentCycle.id, member_id: userId, status: ContributionStatus.CONFIRMED }
        });
        my_contribution_status = contribution ? 'PAID' : 'PENDING';
      }

      return {
        ...tontine,
        my_role: m.role,
        my_status: m.status,
        current_cycle: currentCycle,
        my_contribution_status,
      };
    }));

    return result;
  }

  async findById(tontineId: string, userId: string) {
    const tontine = await this.repository.tontineRepo.findOne({
      where: { id: tontineId },
      relations: ['members', 'members.user'],
    });
    if (!tontine) throw new NotFoundException('Tontine introuvable');
    if (!tontine.members.some(m => m.user_id === userId)) {
      throw new ForbiddenException('Vous ne faites pas partie de cette tontine');
    }
    return tontine;
  }

  async update(tontineId: string, userId: string, dto: UpdateTontineDto) {
    const tontine = await this.repository.tontineRepo.findOne({ where: { id: tontineId } });
    if (!tontine) throw new NotFoundException('Tontine introuvable');
    if (tontine.organizer_id !== userId) throw new ForbiddenException('Seul l\'organisateur peut modifier la tontine');
    if (tontine.status !== TontineStatus.DRAFT) throw new ConflictException('Impossible de modifier, statut brouillon requis');

    await this.repository.tontineRepo.update(tontineId, dto);
    return this.repository.tontineRepo.findOne({ where: { id: tontineId }});
  }

  // --- 2. CYCLE DE VIE (OPEN, START) ---

  async open(tontineId: string, userId: string) {
    const tontine = await this.repository.tontineRepo.findOne({ where: { id: tontineId } });
    if (!tontine) throw new NotFoundException('Tontine introuvable');
    if (tontine.organizer_id !== userId) throw new ForbiddenException('Seul l\'organisateur peut ouvrir la tontine');
    if (tontine.status !== TontineStatus.DRAFT) throw new ConflictException('La tontine doit être en DRAFT pour l\'ouvrir');

    await this.repository.tontineRepo.update(tontineId, { status: TontineStatus.OPEN });
    return { message: 'Tontine ouverte aux inscriptions ! Les membres peuvent maintenant rejoindre.' };
  }

  async start(tontineId: string, userId: string) {
    const tontine = await this.repository.tontineRepo.findOne({ 
      where: { id: tontineId },
      relations: ['members'] 
    });
    if (!tontine) throw new NotFoundException('Tontine introuvable');
    if (tontine.organizer_id !== userId) throw new ForbiddenException('Seul l\'organisateur peut démarrer la tontine');
    if (tontine.status !== TontineStatus.OPEN) throw new ConflictException('La tontine doit être OPEN pour démarrer');

    const confirmedMembers = tontine.members.filter(m => m.status === MemberStatus.CONFIRMED);
    if (confirmedMembers.length < 2) {
      throw new BadRequestException('Il faut au moins 2 membres confirmés pour démarrer la tontine');
    }

    await this.repository.tontineRepo.update(tontineId, { 
      status: TontineStatus.ACTIVE,
      start_date: new Date()
    });

    // Création des N cycles ordonnés en base
    await this.cyclesService.createCycles({
      tontineId,
      confirmedMembers,
      contributionAmount: Number(tontine.contribution_amount),
    });

    // TODO: Envoyer un job BullMQ pour déployer TontineVault.sol sur Polygon
    
    return { 
      message: 'Tontine démarrée avec succès. Déploiement du smart contract sur Polygon en cours...' 
    };
  }

  // --- 3. GESTION DES MEMBRES (JOIN, LIST, VALIDATE) ---

  async join(userId: string, tontineId: string, dto: JoinTontineDto) {
    const tontine = await this.repository.tontineRepo.findOne({ 
      where: { id: tontineId },
      relations: ['members']
    });
    if (!tontine) throw new NotFoundException('Tontine introuvable');
    if (tontine.invitation_code !== dto.invitation_code) {
      throw new BadRequestException('Code d\'invitation invalide pour cette tontine');
    }
    if (tontine.status !== TontineStatus.OPEN) {
      throw new ConflictException('Cette tontine n\'accepte pas d\'inscriptions pour le moment');
    }
    if (tontine.members.length >= tontine.max_members) {
      throw new ConflictException('La tontine a déjà atteint son nombre maximum de membres');
    }
    if (tontine.members.some(m => m.user_id === userId)) {
      throw new ConflictException('Vous avez déjà soumis une demande pour cette tontine');
    }

    const member = this.repository.memberRepo.create({
      tontine_id: tontine.id,
      user_id: userId,
      role: MemberRole.MEMBER,
      status: MemberStatus.PENDING, // Attente de l'approbation de l'organisateur
    });

    await this.repository.memberRepo.save(member);
    // TODO: Envoyer une notification PUSH/SMS à l'organisateur
    return { message: 'Demande d\'adhésion envoyée avec succès à l\'organisateur.' };
  }

  async getMembers(tontineId: string, userId: string) {
    const tontine = await this.repository.tontineRepo.findOne({
      where: { id: tontineId },
      relations: ['members', 'members.user']
    });
    if (!tontine) throw new NotFoundException('Tontine introuvable');
    if (!tontine.members.some(m => m.user_id === userId)) {
      throw new ForbiddenException('Vous ne faites pas partie de cette tontine');
    }

    // On formate la réponse pour ne pas exposer de données sensibles des autres users
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
        credit_score: m.user.credit_score // Permet d'instaurer la confiance
      }
    }));
  }

  async updateMemberStatus(tontineId: string, memberId: string, userId: string, status: MemberStatus) {
    const tontine = await this.repository.tontineRepo.findOne({ where: { id: tontineId } });
    if (!tontine) throw new NotFoundException('Tontine introuvable');
    if (tontine.organizer_id !== userId) throw new ForbiddenException('Seul l\'organisateur peut valider les membres');
    if (tontine.status !== TontineStatus.OPEN) throw new ConflictException('Les inscriptions sont fermées');

    const member = await this.repository.memberRepo.findOne({ where: { id: memberId, tontine_id: tontineId } });
    if (!member) throw new NotFoundException('Membre introuvable');
    if (member.role === MemberRole.ORGANIZER) throw new ConflictException('Impossible de modifier le statut de l\'organisateur lui-même');

    await this.repository.memberRepo.update(memberId, { status });
    // TODO: Notifier l'utilisateur de l'acceptation ou refus de sa demande
    return { message: `Statut du membre mis à jour : ${status}` };
  }
}
