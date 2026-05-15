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
var CinetPayAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CinetPayAdapter = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const crypto = require("crypto");
let CinetPayAdapter = CinetPayAdapter_1 = class CinetPayAdapter {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(CinetPayAdapter_1.name);
        this.baseUrl = 'https://api-checkout.cinetpay.com/v2';
        this.apiKey = this.configService.get('CINETPAY_API_KEY', '');
        this.siteId = this.configService.get('CINETPAY_SITE_ID', '');
    }
    async initiatePayment(payload) {
        const body = {
            apikey: this.apiKey,
            site_id: this.siteId,
            ...payload,
            notify_url: this.configService.get('CINETPAY_NOTIFY_URL'),
            return_url: this.configService.get('CINETPAY_RETURN_URL'),
        };
        this.logger.log(`Initiation CinetPay — ref: ${payload.transaction_id}`);
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/payment`, body, {
            timeout: 10_000,
        }));
        return {
            payment_url: response.data?.data?.payment_url ?? '',
            code: response.data?.code ?? '',
        };
    }
    verifyWebhookSignature(payload) {
        const secretKey = this.configService.get('CINETPAY_SECRET_KEY', '');
        const dataToSign = [
            payload.cpm_site_id,
            payload.cpm_trans_date,
            payload.cpm_trans_id,
            payload.cpm_amount,
            payload.cpm_currency,
        ].join('');
        const expectedSignature = crypto
            .createHmac('sha256', secretKey)
            .update(dataToSign)
            .digest('hex');
        const isValid = expectedSignature === payload.signature;
        if (!isValid) {
            this.logger.warn(`Signature CinetPay invalide — trans: ${payload.cpm_trans_id}`);
        }
        return isValid;
    }
    async checkPaymentStatus(transactionId) {
        const body = {
            apikey: this.apiKey,
            site_id: this.siteId,
            transaction_id: transactionId,
        };
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.baseUrl}/payment/check`, body, { timeout: 10_000 }));
        return response.data?.data?.status ?? 'PENDING';
    }
    static getAllowedIps() {
        return [
            '154.72.168.0',
            '154.72.169.0',
            '154.72.162.0',
        ];
    }
};
exports.CinetPayAdapter = CinetPayAdapter;
exports.CinetPayAdapter = CinetPayAdapter = CinetPayAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], CinetPayAdapter);
//# sourceMappingURL=cinetpay.adapter.js.map