import {
  Injectable, Logger, NotFoundException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { Cycle, CycleStatus }   from './entities/cycle.entity';
import { Contribution, ContributionStatus } from '../contributions/entities/contribution.entity';
import { TontineMember, MemberStatus } from '../tontines/entities/tontine-member.entity';

interface CreateCyclesParams {
  tontineId: string;
  confirmedMembers: TontineMember[];
  contributionAmount: number;
}

@Injectable()
export class CyclesService {
  private readonly logger = new Logger(CyclesService.name);

  constructor(
    @InjectRepository(Cycle)
    private readonly cycleRepo: Repository<Cycle>,

    @InjectRepository(Contribution)
    private readonly contributionRepo: Repository<Contribution>,

    @InjectQueue('notifications-queue')
    private readonly notificationsQueue: Queue,
  ) {}

  // ──────────────────────────────────────────────────────────
  // 1. CRÉATION DES CYCLES (appelé par TontinesService.start())
  // ──────────────────────────────────────────────────────────

  /**
   * Crée N cycles en base, un par membre CONFIRMED.
   * L'ordre de bénéfice est celui du payout_order sur TontineMember.
   * Le 1er cycle est immédiatement mis en ACTIVE.
   */
  async createCycles(params: CreateCyclesParams): Promise<Cycle[]> {
    const { tontineId, confirmedMembers, contributionAmount } = params;

    // Trier par ordre de versement
    const ordered = [...confirmedMembers].sort(
      (a, b) => (a.payout_order ?? 999) - (b.payout_order ?? 999),
    );

    const totalMembers = ordered.length;
    const totalExpected = contributionAmount * totalMembers;
    const cycles: Cycle[] = [];

    for (let i = 0; i < totalMembers; i++) {
      const cycle = this.cycleRepo.create({
        tontine_id: tontineId,
        cycle_number: i + 1,
        beneficiary_id: ordered[i].user_id,
        status: i === 0 ? CycleStatus.ACTIVE : CycleStatus.PENDING, // Le 1er démarre immédiatement
        total_expected: totalExpected,
        total_collected: 0,
        starts_at: i === 0 ? new Date() : null,
      });
      cycles.push(cycle);
    }

    const saved = await this.cycleRepo.save(cycles);
    this.logger.log(`${saved.length} cycles créés pour la tontine ${tontineId}`);

    // Notifier le bénéficiaire du 1er cycle
    await this.notificationsQueue.add('send-sms', {
      member_id: ordered[0].user_id,
      type: 'CYCLE_STARTED_BENEFICIARY',
    });

    return saved;
  }

  // ──────────────────────────────────────────────────────────
  // 2. RÉCUPÉRATION
  // ──────────────────────────────────────────────────────────

  async getCurrentCycle(tontineId: string): Promise<Cycle | null> {
    return this.cycleRepo.findOne({
      where: { tontine_id: tontineId, status: CycleStatus.ACTIVE },
      relations: ['beneficiary'],
    });
  }

  async findById(cycleId: string): Promise<Cycle> {
    const cycle = await this.cycleRepo.findOne({
      where: { id: cycleId },
      relations: ['beneficiary', 'tontine'],
    });
    if (!cycle) throw new NotFoundException('Cycle introuvable');
    return cycle;
  }

  async findByTontine(tontineId: string): Promise<Cycle[]> {
    return this.cycleRepo.find({
      where: { tontine_id: tontineId },
      relations: ['beneficiary'],
      order: { cycle_number: 'ASC' },
    });
  }

  // ──────────────────────────────────────────────────────────
  // 3. VÉRIFICATION DE COMPLÉTION DU CYCLE
  //    Appelé par ContributionsService après chaque paiement confirmé
  // ──────────────────────────────────────────────────────────

  /**
   * Vérifie si toutes les cotisations du cycle sont collectées.
   * Si oui : complète le cycle et active le suivant.
   */
  async checkCycleCompletion(cycleId: string): Promise<void> {
    const cycle = await this.cycleRepo.findOne({
      where: { id: cycleId },
      relations: ['tontine'],
    });
    if (!cycle || cycle.status !== CycleStatus.ACTIVE) return;

    // Compter les cotisations CONFIRMED pour ce cycle
    const confirmedCount = await this.contributionRepo.count({
      where: { cycle_id: cycleId, status: ContributionStatus.CONFIRMED },
    });

    // Recalculer le montant collecté
    const result = await this.contributionRepo
      .createQueryBuilder('c')
      .select('SUM(c.amount)', 'total')
      .where('c.cycle_id = :cycleId', { cycleId })
      .andWhere('c.status = :status', { status: ContributionStatus.CONFIRMED })
      .getRawOne();

    const totalCollected = parseFloat(result?.total ?? '0');

    await this.cycleRepo.update(cycleId, { total_collected: totalCollected });

    this.logger.log(
      `Cycle ${cycle.cycle_number} — collecté: ${totalCollected} / attendu: ${cycle.total_expected}`,
    );

    // Vérifier si le montant total est atteint
    if (totalCollected >= Number(cycle.total_expected)) {
      this.logger.log(`✅ Cycle ${cycle.cycle_number} complet — déclenchement du versement`);
      await this.completeCycleAndAdvance(cycle);
    }
  }

  // ──────────────────────────────────────────────────────────
  // 4. COMPLÉTION ET PASSAGE AU CYCLE SUIVANT
  // ──────────────────────────────────────────────────────────

  private async completeCycleAndAdvance(cycle: Cycle): Promise<void> {
    // a) Marquer le cycle actuel COMPLETED
    await this.cycleRepo.update(cycle.id, {
      status: CycleStatus.COMPLETED,
      ends_at: new Date(),
    });

    // b) Notifier le bénéficiaire du versement
    await this.notificationsQueue.add('send-sms', {
      member_id: cycle.beneficiary_id,
      type: 'PAYOUT_INCOMING',
      amount: cycle.total_collected,
    });

    // c) Activer le cycle suivant (si il existe)
    const nextCycle = await this.cycleRepo.findOne({
      where: {
        tontine_id: cycle.tontine_id,
        cycle_number: cycle.cycle_number + 1,
        status: CycleStatus.PENDING,
      },
    });

    if (nextCycle) {
      await this.cycleRepo.update(nextCycle.id, {
        status: CycleStatus.ACTIVE,
        starts_at: new Date(),
      });

      // Notifier le nouveau bénéficiaire
      await this.notificationsQueue.add('send-sms', {
        member_id: nextCycle.beneficiary_id,
        type: 'CYCLE_STARTED_BENEFICIARY',
      });

      this.logger.log(`Cycle ${nextCycle.cycle_number} activé pour tontine ${cycle.tontine_id}`);
    } else {
      this.logger.log(`🎉 Tontine ${cycle.tontine_id} — tous les cycles terminés !`);
      // TODO: mettre le statut de la tontine à COMPLETED
    }
  }

  /** Met à jour le tx_hash du versement blockchain (appelé par BlockchainWorker) */
  async updatePayoutTxHash(cycleId: string, txHash: string): Promise<void> {
    await this.cycleRepo.update(cycleId, { payout_tx_hash: txHash });
  }
}
