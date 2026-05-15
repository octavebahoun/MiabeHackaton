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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const fedapay_adapter_1 = require("./fedapay.adapter");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(fedapayAdapter) {
        this.fedapayAdapter = fedapayAdapter;
        this.logger = new common_1.Logger(PaymentsService_1.name);
    }
    async initiatePayment(payload) {
        this.logger.log(`Initiation du paiement via PaymentsService pour ${payload.transaction_id}`);
        return this.fedapayAdapter.initiatePayment(payload);
    }
    verifyWebhookSignature(rawBody, signature) {
        return this.fedapayAdapter.verifyWebhookSignature(rawBody, signature);
    }
    async checkPaymentStatus(transactionId) {
        return this.fedapayAdapter.checkPaymentStatus(transactionId);
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [fedapay_adapter_1.FedaPayAdapter])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map