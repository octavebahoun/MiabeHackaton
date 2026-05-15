import {
  Injectable, NotFoundException, ConflictException,
  BadRequestException, Logger, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as crypto from 'crypto';

import { Contribution, ContributionStatus, PaymentMethod } from './entities/contribution.entity';
import { InitiateContributionDto } from './dto/initiate-contribution.dto';
import { FedaPayAdapter, FedaPayWebhookPayload } from '../payments/fedapay.adapter';
import { generatePaymentRef } from '../../common/utils/crypto.util';

interface CycleRef {
  id: string;
  tontine_id: string;
  status: string;
  contribution_amount: number;
}

@Injectable()
export class ContributionsService {
  private readonly logger = new Logger(ContributionsService.name);

  constructor(
    @InjectRepository(Contribution)
    private readonly contributionRepo: Repository<Contribution>,

    private readonly fedaPay: FedaPayAdapter,

    @InjectRedis()
    private readonly redis: Redis,

    @InjectQueue('blockchain-queue')
    private readonly blockchainQueue: Queue,

    @InjectQueue('notifications-queue')
    private readonly notificationsQueue: Queue,
  ) {}

  // ─────────────────────────────────────────────
  // 1. INITIER UN PAIEMENT
  // ─────────────────────────────────────────────

  async initiate(userId: string, dto: InitiateContributionDto, cycle: CycleRef) {
    if (cycle.status !== 'ACTIVE') {
      throw new ConflictException('Ce cycle n\'est pas actif');
    }

    // Vérifier si l'utilisateur a déjà une cotisation CONFIRMED pour ce cycle
    const already = await this.contributionRepo.findOne({
      where: { cycle_id: dto.cycle_id, member_id: userId, status: ContributionStatus.CONFIRMED },
    });
    if (already) {
      throw new ConflictException('Vous avez déjà cotisé pour ce cycle');
    }

    // Générer la référence unique (idempotence)
    const payment_ref = generatePaymentRef();

    // Sauvegarder l'intention de paiement (statut PENDING)
    const contribution = this.contributionRepo.create({
      cycle_id: dto.cycle_id,
      member_id: userId,
      amount: cycle.contribution_amount,
      payment_ref,
      payment_method: dto.payment_method,
      status: ContributionStatus.PENDING,
    });
    await this.contributionRepo.save(contribution);

    // Appel FedaPay pour initier le paiement Mobile Money
    const { payment_url, transaction_id } = await this.fedaPay.initiatePayment({
      amount: cycle.contribution_amount,
      currency: 'XOF',
      transaction_id: payment_ref,
      description: `Cotisation TontineChain — Cycle ${dto.cycle_id}`,
      customer_full_name: userId,
      customer_phone_number: dto.phone_number,
    });

    // Sauvegarder l'ID de transaction FedaPay pour le polling fallback
    await this.contributionRepo.update(contribution.id, {
      cinetpay_trans_id: String(transaction_id), // Réutilise le champ (renommable en migration DB)
    });

    this.logger.log(`Paiement initié — ref: ${payment_ref}, FedaPay tx: ${transaction_id}`);

    return {
      contribution_id: contribution.id,
      payment_ref,
      payment_url,
      amount: cycle.contribution_amount,
      currency: 'XOF',
      status: ContributionStatus.PENDING,
    };
  }

  // ─────────────────────────────────────────────
  // 2. WEBHOOK FEDAPAY
  // ─────────────────────────────────────────────

  async handleFedaPayWebhook(
    payload: FedaPayWebhookPayload,
    rawBody: string,
    signature: string,
  ): Promise<void> {
    // a) Vérification signature HMAC-SHA256
    if (!this.fedaPay.verifyWebhookSignature(rawBody, signature)) {
      throw new BadRequestException('Signature webhook FedaPay invalide');
    }

    const { event, data } = payload;
    const ref = data?.object?.reference ?? data?.object?.['metadata']?.payment_ref;
    const transactionId = data?.object?.id;

    if (!ref && !transactionId) {
      this.logger.warn('Webhook FedaPay sans référence exploitable');
      return;
    }

    // b) Idempotence via Redis SETNX — 0 double traitement possible
    const idempotenceKey = `webhook:fedapay:${transactionId ?? ref}`;
    const alreadyProcessed = await this.redis.set(idempotenceKey, 'processed', 'EX', 86_400, 'NX');
    if (!alreadyProcessed) {
      this.logger.warn(`Webhook déjà traité — tx: ${transactionId}`);
      return;
    }

    // c) Retrouver la contribution via payment_ref
    const contribution = await this.contributionRepo.findOne({
      where: { payment_ref: ref },
    });
    if (!contribution) {
      this.logger.error(`Contribution introuvable — ref: ${ref}`);
      return;
    }

    // d) Vérification du montant
    const receivedAmount = data?.object?.amount;
    if (receivedAmount && receivedAmount !== Number(contribution.amount)) {
      this.logger.error(`Montant incorrect — attendu: ${contribution.amount}, reçu: ${receivedAmount}`);
      await this.contributionRepo.update(contribution.id, { status: ContributionStatus.FAILED });
      return;
    }

    // e) Traitement selon l'événement FedaPay
    if (FedaPayAdapter.isSuccessEvent(event)) {
      // Paiement RÉUSSI ✅
      await this.contributionRepo.update(contribution.id, {
        status: ContributionStatus.CONFIRMED,
        paid_at: new Date(),
      });

      // Générer la preuve cryptographique
      const proofHash = crypto
        .createHash('sha256')
        .update(`${contribution.id}:${contribution.amount}:${new Date().toISOString()}`)
        .digest('hex');

      await this.contributionRepo.update(contribution.id, { proof_hash: proofHash });

      this.logger.log(`Paiement FedaPay confirmé — ref: ${ref}`);

      // Job asynchrone → Blockchain Polygon
      await this.blockchainQueue.add('record-contribution-onchain', {
        contribution_id: contribution.id,
        cycle_id:        contribution.cycle_id,
        member_id:       contribution.member_id,
        amount:          contribution.amount,
        proof_hash:      proofHash,
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5_000 },
      });

      // Notification SMS au membre
      await this.notificationsQueue.add('send-sms', {
        member_id: contribution.member_id,
        type: 'CONTRIBUTION_CONFIRMED',
        amount: contribution.amount,
      });

    } else if (FedaPayAdapter.isFailureEvent(event)) {
      // Paiement ÉCHOUÉ ❌
      await this.contributionRepo.update(contribution.id, {
        status: ContributionStatus.FAILED,
      });
      this.logger.warn(`Paiement FedaPay échoué — event: ${event}, ref: ${ref}`);
    } else {
      this.logger.log(`Événement FedaPay ignoré: ${event}`);
    }
  }

  // ─────────────────────────────────────────────
  // 3. LECTURE
  // ─────────────────────────────────────────────

  async findByCycle(cycleId: string) {
    return this.contributionRepo.find({ where: { cycle_id: cycleId } });
  }

  async findMyHistory(userId: string) {
    return this.contributionRepo.find({
      where: { member_id: userId },
      order: { created_at: 'DESC' },
    });
  }
}
