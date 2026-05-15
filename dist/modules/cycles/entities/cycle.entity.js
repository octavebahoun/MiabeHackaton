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
exports.Cycle = exports.CycleStatus = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const tontine_entity_1 = require("../../tontines/entities/tontine.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var CycleStatus;
(function (CycleStatus) {
    CycleStatus["PENDING"] = "PENDING";
    CycleStatus["ACTIVE"] = "ACTIVE";
    CycleStatus["COMPLETED"] = "COMPLETED";
})(CycleStatus || (exports.CycleStatus = CycleStatus = {}));
let Cycle = class Cycle {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, tontine_id: { required: true, type: () => String }, tontine: { required: true, type: () => require("../../tontines/entities/tontine.entity").Tontine }, cycle_number: { required: true, type: () => Number }, beneficiary_id: { required: true, type: () => String }, beneficiary: { required: true, type: () => require("../../users/entities/user.entity").User }, status: { required: true, enum: require("./cycle.entity").CycleStatus }, total_expected: { required: true, type: () => Number }, total_collected: { required: true, type: () => Number }, payout_tx_hash: { required: true, type: () => String }, starts_at: { required: true, type: () => Date }, ends_at: { required: true, type: () => Date }, created_at: { required: true, type: () => Date } };
    }
};
exports.Cycle = Cycle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Cycle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], Cycle.prototype, "tontine_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tontine_entity_1.Tontine, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tontine_id' }),
    __metadata("design:type", tontine_entity_1.Tontine)
], Cycle.prototype, "tontine", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Cycle.prototype, "cycle_number", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], Cycle.prototype, "beneficiary_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'beneficiary_id' }),
    __metadata("design:type", user_entity_1.User)
], Cycle.prototype, "beneficiary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CycleStatus, default: CycleStatus.PENDING }),
    __metadata("design:type", String)
], Cycle.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Cycle.prototype, "total_expected", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Cycle.prototype, "total_collected", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Cycle.prototype, "payout_tx_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Cycle.prototype, "starts_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Cycle.prototype, "ends_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Cycle.prototype, "created_at", void 0);
exports.Cycle = Cycle = __decorate([
    (0, typeorm_1.Entity)('cycles')
], Cycle);
//# sourceMappingURL=cycle.entity.js.map