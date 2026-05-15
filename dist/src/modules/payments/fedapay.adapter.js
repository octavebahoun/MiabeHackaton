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
var FedaPayAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FedaPayAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
const fedapay_1 = require("fedapay");
let FedaPayAdapter = FedaPayAdapter_1 = class FedaPayAdapter {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(FedaPayAdapter_1.name);
        fedapay_1.default.setApiKey(this.configService.get('FEDAPAY_SECRET_KEY', ''));
        fedapay_1.default.setEnvironment(this.configService.get('NODE_ENV') === 'production' ? 'live' : 'sandbox');
    }
    async initiatePayment(payload) {
        this.logger.log(`Initiation FedaPay — ref: ${payload.transaction_id}`);
        const countryCode = this.resolveCountryCode(payload.customer_phone_number);
        const localPhone = payload.customer_phone_number.replace(/^\+\d{3}/, '');
        const transaction = await fedapay_1.default.Transaction.create({
            description: payload.description,
            amount: payload.amount,
            currency: { iso: payload.currency },
            callback_url: this.configService.get('FEDAPAY_CALLBACK_URL', ''),
            metadata: { payment_ref: payload.transaction_id },
            customer: {
                firstname: payload.customer_full_name.split(' ')[0] ?? payload.customer_full_name,
                lastname: payload.customer_full_name.split(' ').slice(1).join(' ') || '-',
                phone_number: {
                    number: localPhone,
                    country: countryCode,
                },
            },
        });
        const tokenObj = await transaction.generateToken();
        this.logger.log(`Paiement FedaPay créé — tx_id: ${transaction.id}, url: ${tokenObj.url}`);
        return {
            payment_url: tokenObj.url,
            transaction_id: transaction.id,
            token: tokenObj.token,
        };
    }
    verifyWebhookSignature(rawBody, signatureHeader) {
        const webhookSecret = this.configService.get('FEDAPAY_WEBHOOK_SECRET', '');
        if (!signatureHeader || !webhookSecret) {
            this.logger.warn('Signature ou secret webhook manquant');
            return false;
        }
        const [algo, receivedDigest] = signatureHeader.split('=');
        if (algo !== 'sha256')
            return false;
        const expectedDigest = crypto
            .createHmac('sha256', webhookSecret)
            .update(rawBody, 'utf8')
            .digest('hex');
        const isValid = crypto.timingSafeEqual(Buffer.from(expectedDigest, 'hex'), Buffer.from(receivedDigest, 'hex'));
        if (!isValid) {
            this.logger.warn(`Signature FedaPay invalide — reçue: ${receivedDigest}`);
        }
        return isValid;
    }
    async checkPaymentStatus(transactionId) {
        const transaction = await fedapay_1.default.Transaction.retrieve(transactionId);
        const status = transaction.status;
        if (status === 'approved')
            return 'approved';
        if (status === 'declined' || status === 'canceled')
            return 'declined';
        return 'pending';
    }
    resolveCountryCode(phone) {
        const prefixMap = {
            '+229': 'BJ',
            '+225': 'CI',
            '+228': 'TG',
            '+226': 'BF',
            '+221': 'SN',
            '+223': 'ML',
            '+224': 'GN',
            '+237': 'CM',
        };
        for (const [prefix, code] of Object.entries(prefixMap)) {
            if (phone.startsWith(prefix))
                return code;
        }
        return 'BJ';
    }
    static isSuccessEvent(event) {
        return event === 'transaction.approved';
    }
    static isFailureEvent(event) {
        return ['transaction.declined', 'transaction.canceled'].includes(event);
    }
};
exports.FedaPayAdapter = FedaPayAdapter;
exports.FedaPayAdapter = FedaPayAdapter = FedaPayAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FedaPayAdapter);
//# sourceMappingURL=fedapay.adapter.js.map