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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contribution = exports.PaymentMethod = exports.ContributionStatus = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
var ContributionStatus;
(function (ContributionStatus) {
    ContributionStatus["PENDING"] = "PENDING";
    ContributionStatus["CONFIRMED"] = "CONFIRMED";
    ContributionStatus["FAILED"] = "FAILED";
    ContributionStatus["BLOCKCHAIN_FAILED"] = "BLOCKCHAIN_FAILED";
})(ContributionStatus || (exports.ContributionStatus = ContributionStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["MTN_MOMO"] = "MTN_MOMO";
    PaymentMethod["MOOV_MONEY"] = "MOOV_MONEY";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
let Contribution = class Contribution {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, cycle_id: { required: true, type: () => String }, member_id: { required: true, type: () => String }, amount: { required: true, type: () => Number }, payment_ref: { required: true, type: () => String }, cinetpay_trans_id: { required: true, type: () => String }, status: { required: true, enum: require("./contribution.entity").ContributionStatus }, payment_method: { required: true, enum: require("./contribution.entity").PaymentMethod }, blockchain_confirmed: { required: true, type: () => Boolean }, blockchain_tx_hash: { required: true, type: () => String }, proof_hash: { required: true, type: () => String }, paid_at: { required: true, type: () => Date }, created_at: { required: true, type: () => Date } };
    }
};
exports.Contribution = Contribution;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Contribution.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], Contribution.prototype, "cycle_id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], Contribution.prototype, "member_id", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Contribution.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Contribution.prototype, "payment_ref", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Contribution.prototype, "cinetpay_trans_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ContributionStatus, default: ContributionStatus.PENDING }),
    __metadata("design:type", String)
], Contribution.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: PaymentMethod }),
    __metadata("design:type", String)
], Contribution.prototype, "payment_method", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Contribution.prototype, "blockchain_confirmed", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Contribution.prototype, "blockchain_tx_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Contribution.prototype, "proof_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Contribution.prototype, "paid_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Contribution.prototype, "created_at", void 0);
exports.Contribution = Contribution = __decorate([
    (0, typeorm_1.Entity)('contributions')
], Contribution);
//# sourceMappingURL=contribution.entity.js.map