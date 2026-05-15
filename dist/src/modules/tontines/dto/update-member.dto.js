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
exports.UpdateMemberDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const tontine_member_entity_1 = require("../entities/tontine-member.entity");
class UpdateMemberDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: true, enum: require("../entities/tontine-member.entity").MemberStatus } };
    }
}
exports.UpdateMemberDto = UpdateMemberDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: [tontine_member_entity_1.MemberStatus.CONFIRMED, tontine_member_entity_1.MemberStatus.REJECTED], description: 'Statut à appliquer au membre' }),
    (0, class_validator_1.IsEnum)(tontine_member_entity_1.MemberStatus),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateMemberDto.prototype, "status", void 0);
//# sourceMappingURL=update-member.dto.js.map