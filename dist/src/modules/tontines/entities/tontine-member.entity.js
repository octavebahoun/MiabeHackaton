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
exports.TontineMember = exports.MemberStatus = exports.MemberRole = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const tontine_entity_1 = require("./tontine.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var MemberRole;
(function (MemberRole) {
    MemberRole["ORGANIZER"] = "ORGANIZER";
    MemberRole["MEMBER"] = "MEMBER";
})(MemberRole || (exports.MemberRole = MemberRole = {}));
var MemberStatus;
(function (MemberStatus) {
    MemberStatus["PENDING"] = "PENDING";
    MemberStatus["CONFIRMED"] = "CONFIRMED";
    MemberStatus["REJECTED"] = "REJECTED";
})(MemberStatus || (exports.MemberStatus = MemberStatus = {}));
let TontineMember = class TontineMember {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, tontine_id: { required: true, type: () => String }, tontine: { required: true, type: () => require("./tontine.entity").Tontine }, user_id: { required: true, type: () => String }, user: { required: true, type: () => require("../../users/entities/user.entity").User }, role: { required: true, enum: require("./tontine-member.entity").MemberRole }, status: { required: true, enum: require("./tontine-member.entity").MemberStatus }, payout_order: { required: true, type: () => Number }, joined_at: { required: true, type: () => Date } };
    }
};
exports.TontineMember = TontineMember;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TontineMember.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], TontineMember.prototype, "tontine_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tontine_entity_1.Tontine, tontine => tontine.members, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tontine_id' }),
    __metadata("design:type", tontine_entity_1.Tontine)
], TontineMember.prototype, "tontine", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], TontineMember.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], TontineMember.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: MemberRole, default: MemberRole.MEMBER }),
    __metadata("design:type", String)
], TontineMember.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: MemberStatus, default: MemberStatus.PENDING }),
    __metadata("design:type", String)
], TontineMember.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TontineMember.prototype, "payout_order", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TontineMember.prototype, "joined_at", void 0);
exports.TontineMember = TontineMember = __decorate([
    (0, typeorm_1.Entity)('tontine_members'),
    (0, typeorm_1.Unique)(['tontine_id', 'user_id'])
], TontineMember);
//# sourceMappingURL=tontine-member.entity.js.map