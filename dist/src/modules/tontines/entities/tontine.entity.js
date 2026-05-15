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
exports.Tontine = exports.TontineStatus = exports.TontineFrequency = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const tontine_member_entity_1 = require("./tontine-member.entity");
var TontineFrequency;
(function (TontineFrequency) {
    TontineFrequency["WEEKLY"] = "WEEKLY";
    TontineFrequency["BIWEEKLY"] = "BIWEEKLY";
    TontineFrequency["MONTHLY"] = "MONTHLY";
})(TontineFrequency || (exports.TontineFrequency = TontineFrequency = {}));
var TontineStatus;
(function (TontineStatus) {
    TontineStatus["DRAFT"] = "DRAFT";
    TontineStatus["OPEN"] = "OPEN";
    TontineStatus["ACTIVE"] = "ACTIVE";
    TontineStatus["COMPLETED"] = "COMPLETED";
    TontineStatus["CANCELLED"] = "CANCELLED";
})(TontineStatus || (exports.TontineStatus = TontineStatus = {}));
let Tontine = class Tontine {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, organizer_id: { required: true, type: () => String }, organizer: { required: true, type: () => require("../../users/entities/user.entity").User }, contribution_amount: { required: true, type: () => Number }, frequency: { required: true, enum: require("./tontine.entity").TontineFrequency }, max_members: { required: true, type: () => Number }, status: { required: true, enum: require("./tontine.entity").TontineStatus }, invitation_code: { required: true, type: () => String }, contract_address: { required: true, type: () => String }, start_date: { required: true, type: () => Date }, members: { required: true, type: () => [require("./tontine-member.entity").TontineMember] }, created_at: { required: true, type: () => Date }, updated_at: { required: true, type: () => Date } };
    }
};
exports.Tontine = Tontine;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Tontine.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Tontine.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], Tontine.prototype, "organizer_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'organizer_id' }),
    __metadata("design:type", user_entity_1.User)
], Tontine.prototype, "organizer", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Tontine.prototype, "contribution_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TontineFrequency }),
    __metadata("design:type", String)
], Tontine.prototype, "frequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Tontine.prototype, "max_members", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TontineStatus, default: TontineStatus.DRAFT }),
    __metadata("design:type", String)
], Tontine.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Tontine.prototype, "invitation_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tontine.prototype, "contract_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Tontine.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tontine_member_entity_1.TontineMember, (member) => member.tontine),
    __metadata("design:type", Array)
], Tontine.prototype, "members", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Tontine.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Tontine.prototype, "updated_at", void 0);
exports.Tontine = Tontine = __decorate([
    (0, typeorm_1.Entity)('tontines')
], Tontine);
//# sourceMappingURL=tontine.entity.js.map