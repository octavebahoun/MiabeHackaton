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
exports.CreateTontineDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const tontine_entity_1 = require("../entities/tontine.entity");
class CreateTontineDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String, minLength: 3, maxLength: 100 }, contribution_amount: { required: true, type: () => Number, minimum: 1000 }, frequency: { required: true, enum: require("../entities/tontine.entity").TontineFrequency }, max_members: { required: true, type: () => Number, minimum: 2, maximum: 50 }, start_date: { required: false, type: () => Date }, max_absences: { required: false, type: () => Number, minimum: 0 }, penalty_amount: { required: false, type: () => Number, minimum: 0 } };
    }
}
exports.CreateTontineDto = CreateTontineDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Voyage Dubai 2027', description: 'Nom de la tontine (3-100 chars)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(3, 100),
    __metadata("design:type", String)
], CreateTontineDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50000, description: 'Montant de cotisation périodique (en XOF)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1000),
    __metadata("design:type", Number)
], CreateTontineDto.prototype, "contribution_amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: tontine_entity_1.TontineFrequency, example: tontine_entity_1.TontineFrequency.MONTHLY }),
    (0, class_validator_1.IsEnum)(tontine_entity_1.TontineFrequency),
    __metadata("design:type", String)
], CreateTontineDto.prototype, "frequency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10, description: 'Nombre maximum de membres autorisés (2 à 50)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(2),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateTontineDto.prototype, "max_members", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-01T00:00:00Z', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreateTontineDto.prototype, "start_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTontineDto.prototype, "max_absences", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1000, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTontineDto.prototype, "penalty_amount", void 0);
//# sourceMappingURL=create-tontine.dto.js.map