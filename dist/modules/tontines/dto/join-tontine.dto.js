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
exports.JoinTontineDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class JoinTontineDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { invitation_code: { required: true, type: () => String, minLength: 8, maxLength: 8 } };
    }
}
exports.JoinTontineDto = JoinTontineDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '8E7A3F2B', description: 'Code d\'invitation secret de la tontine' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(8, 8),
    __metadata("design:type", String)
], JoinTontineDto.prototype, "invitation_code", void 0);
//# sourceMappingURL=join-tontine.dto.js.map