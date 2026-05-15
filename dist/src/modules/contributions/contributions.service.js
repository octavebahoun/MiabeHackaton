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
var ContributionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContributionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ioredis_1 = require("@nestjs-modules/ioredis");
const ioredis_2 = require("ioredis");
const bull_1 = require("@nestjs/bull");
const crypto = require("crypto");
const contribution_entity_1 = require("./entities/contribution.entity");
const fedapay_adapter_1 = require("../payments/fedapay.adapter");
const crypto_util_1 = require("../../common/utils/crypto.util");
let ContributionsService = ContributionsService_1 = class ContributionsService {
    constructor(contributionRepo, fedaPay, redis, blockchainQueue, notificationsQueue) {
        this.contributionRepo = contributionRepo;
        this.fedaPay = fedaPay;
        this.redis = redis;
        this.blockchainQueue = blockchainQueue;
        this.notificationsQueue = notificationsQueue;
        this.logger = new common_1.Logger(ContributionsService_1.name);
    }
    async initiate(userId, dto, cycle) {
        if (cycle.status !== 'ACTIVE') {
            throw new common_1.ConflictException('Ce cycle n\'est pas actif');
        }
        const already = await this.contributionRepo.findOne({
            where: { cycle_id: dto.cycle_id, member_id: userId, status: contribution_entity_1.ContributionStatus.CONFIRMED },
        });
        if (already) {
            throw new common_1.ConflictException('Vous avez déjà cotisé pour ce cycle');
        }
        const payment_ref = (0, crypto_util_1.generatePaymentRef)();
        const contribution = this.contributionRepo.create({
            cycle_id: dto.cycle_id,
            member_id: userId,
            amount: cycle.contribution_amount,
            payment_ref,
            payment_method: dto.payment_method,
            status: contribution_entity_1.ContributionStatus.PENDING,
        });
        await this.contributionRepo.save(contribution);
        const { payment_url, transaction_id } = await this.fedaPay.initiatePayment({
            amount: cycle.contribution_amount,
            currency: 'XOF',
            transaction_id: payment_ref,
            description: `Cotisation TontineChain — Cycle ${dto.cycle_id}`,
            customer_full_name: userId,
            customer_phone_number: dto.phone_number,
        });
        await this.contributionRepo.update(contribution.id, {
            cinetpay_trans_id: String(transaction_id),
        });
        this.logger.log(`Paiement initié — ref: ${payment_ref}, FedaPay tx: ${transaction_id}`);
        return {
            contribution_id: contribution.id,
            payment_ref,
            payment_url,
            amount: cycle.contribution_amount,
            currency: 'XOF',
            status: contribution_entity_1.ContributionStatus.PENDING,
        };
    }
    async handleFedaPayWebhook(payload, rawBody, signature) {
        if (!this.fedaPay.verifyWebhookSignature(rawBody, signature)) {
            throw new common_1.BadRequestException('Signature webhook FedaPay invalide');
        }
        const { event, data } = payload;
        const ref = data?.object?.reference ?? data?.object?.['metadata']?.payment_ref;
        const transactionId = data?.object?.id;
        if (!ref && !transactionId) {
            this.logger.warn('Webhook FedaPay sans référence exploitable');
            return;
        }
        const idempotenceKey = `webhook:fedapay:${transactionId ?? ref}`;
        const alreadyProcessed = await this.redis.set(idempotenceKey, 'processed', 'EX', 86_400, 'NX');
        if (!alreadyProcessed) {
            this.logger.warn(`Webhook déjà traité — tx: ${transactionId}`);
            return;
        }
        const contribution = await this.contributionRepo.findOne({
            where: { payment_ref: ref },
        });
        if (!contribution) {
            this.logger.error(`Contribution introuvable — ref: ${ref}`);
            return;
        }
        const receivedAmount = data?.object?.amount;
        if (receivedAmount && receivedAmount !== Number(contribution.amount)) {
            this.logger.error(`Montant incorrect — attendu: ${contribution.amount}, reçu: ${receivedAmount}`);
            await this.contributionRepo.update(contribution.id, { status: contribution_entity_1.ContributionStatus.FAILED });
            return;
        }
        if (fedapay_adapter_1.FedaPayAdapter.isSuccessEvent(event)) {
            await this.contributionRepo.update(contribution.id, {
                status: contribution_entity_1.ContributionStatus.CONFIRMED,
                paid_at: new Date(),
            });
            const proofHash = crypto
                .createHash('sha256')
                .update(`${contribution.id}:${contribution.amount}:${new Date().toISOString()}`)
                .digest('hex');
            await this.contributionRepo.update(contribution.id, { proof_hash: proofHash });
            this.logger.log(`Paiement FedaPay confirmé — ref: ${ref}`);
            await this.blockchainQueue.add('record-contribution-onchain', {
                contribution_id: contribution.id,
                cycle_id: contribution.cycle_id,
                member_id: contribution.member_id,
                amount: contribution.amount,
                proof_hash: proofHash,
            }, {
                attempts: 3,
                backoff: { type: 'exponential', delay: 5_000 },
            });
            await this.notificationsQueue.add('send-sms', {
                member_id: contribution.member_id,
                type: 'CONTRIBUTION_CONFIRMED',
                amount: contribution.amount,
            });
        }
        else if (fedapay_adapter_1.FedaPayAdapter.isFailureEvent(event)) {
            await this.contributionRepo.update(contribution.id, {
                status: contribution_entity_1.ContributionStatus.FAILED,
            });
            this.logger.warn(`Paiement FedaPay échoué — event: ${event}, ref: ${ref}`);
        }
        else {
            this.logger.log(`Événement FedaPay ignoré: ${event}`);
        }
    }
    async findByCycle(cycleId) {
        return this.contributionRepo.find({ where: { cycle_id: cycleId } });
    }
    async findMyHistory(userId) {
        return this.contributionRepo.find({
            where: { member_id: userId },
            order: { created_at: 'DESC' },
        });
    }
};
exports.ContributionsService = ContributionsService;
exports.ContributionsService = ContributionsService = ContributionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contribution_entity_1.Contribution)),
    __param(2, (0, ioredis_1.InjectRedis)()),
    __param(3, (0, bull_1.InjectQueue)('blockchain-queue')),
    __param(4, (0, bull_1.InjectQueue)('notifications-queue')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        fedapay_adapter_1.FedaPayAdapter,
        ioredis_2.default, Object, Object])
], ContributionsService);
//# sourceMappingURL=contributions.service.js.map