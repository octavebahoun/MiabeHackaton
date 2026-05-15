import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BlockchainService } from '../blockchain.service';
import { Contribution, ContributionStatus } from '../../contributions/entities/contribution.entity';
import { Tontine } from '../../tontines/entities/tontine.entity';

@Processor('blockchain-queue')
export class BlockchainWorker {
  private readonly logger = new Logger(BlockchainWorker.name);

  constructor(
    private readonly blockchainService: BlockchainService,

    @InjectRepository(Contribution)
    private readonly contributionRepo: Repository<Contribution>,

    @InjectRepository(Tontine)
    private readonly tontineRepo: Repository<Tontine>,
  ) {}

  // ─────────────────────────────────────────────
  // JOB 1 : Déploiement du smart contract TontineVault
  // ─────────────────────────────────────────────
  @Process('deploy-tontine-vault')
  async handleDeploy(job: Job<{ tontine_id: string }>) {
    const { tontine_id } = job.data;
    this.logger.log(`[deploy-tontine-vault] Démarrage — tontine: ${tontine_id}`);

    try {
      const contractAddress = await this.blockchainService.deployTontineVault(tontine_id);

      // Enregistrement de l'adresse du contrat en base
      await this.tontineRepo.update(tontine_id, { contract_address: contractAddress });

      this.logger.log(`[deploy-tontine-vault] ✅ Succès — adresse: ${contractAddress}`);
      return { contract_address: contractAddress };
    } catch (err) {
      this.logger.error(`[deploy-tontine-vault] ❌ Erreur — tontine: ${tontine_id}`, err.message);
      throw err; // BullMQ va retenter selon la config (max 3 fois, backoff exponentiel)
    }
  }

  // ─────────────────────────────────────────────
  // JOB 2 : Enregistrement d'une preuve de cotisation on-chain
  // ─────────────────────────────────────────────
  @Process('record-contribution-onchain')
  async handleRecord(job: Job<{
    contribution_id: string;
    cycle_id: string;
    member_id: string;
    amount: number;
    proof_hash: string;
  }>) {
    const { contribution_id, cycle_id, member_id, proof_hash } = job.data;
    this.logger.log(`[record-contribution-onchain] Démarrage — contribution: ${contribution_id}`);

    try {
      // Récupérer l'adresse du smart contract de la tontine associée au cycle
      // Pour l'instant on récupère via une jointure Contribution → Cycle → Tontine
      // (sera refactorisé quand CyclesModule sera branché)
      const contribution = await this.contributionRepo.findOne({
        where: { id: contribution_id },
      });

      if (!contribution) {
        this.logger.warn(`Contribution ${contribution_id} introuvable — job abandonné`);
        return;
      }

      // Ici le contract_address viendra du cycle (stub pour l'instant)
      // TODO: injecter CyclesService et récupérer via cycle_id → tontine.contract_address
      const contractAddress = ''; // sera renseigné quand CyclesModule sera connecté

      if (!contractAddress) {
        this.logger.warn(`Adresse contrat vide pour contribution ${contribution_id} — job différé`);
        throw new Error('CONTRACT_ADDRESS_NOT_YET_AVAILABLE');
      }

      const txHash = await this.blockchainService.recordContributionOnChain({
        contractAddress,
        cycleNumber: 1, // sera fourni par CyclesModule
        memberAddress: member_id,
        proofHash: proof_hash,
        contributionId: contribution_id,
      });

      await this.contributionRepo.update(contribution_id, {
        blockchain_confirmed: true,
        blockchain_tx_hash: txHash,
      });

      this.logger.log(`[record-contribution-onchain] ✅ Preuve enregistrée — tx: ${txHash}`);
      return { tx_hash: txHash };

    } catch (err) {
      this.logger.error(`[record-contribution-onchain] ❌ Erreur`, err.message);

      // Après tous les retries épuisés, marquer comme BLOCKCHAIN_FAILED
      if (job.attemptsMade >= (job.opts.attempts ?? 3) - 1) {
        await this.contributionRepo.update(contribution_id, {
          status: ContributionStatus.BLOCKCHAIN_FAILED,
        });
        this.logger.error(`Contribution ${contribution_id} → BLOCKCHAIN_FAILED après ${job.attemptsMade + 1} tentatives`);
      }
      throw err;
    }
  }
}
