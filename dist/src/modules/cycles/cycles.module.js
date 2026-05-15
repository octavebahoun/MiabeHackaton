"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyclesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const cycles_controller_1 = require("./cycles.controller");
const cycles_service_1 = require("./cycles.service");
const cycle_entity_1 = require("./entities/cycle.entity");
const contribution_entity_1 = require("../contributions/entities/contribution.entity");
const tontine_member_entity_1 = require("../tontines/entities/tontine-member.entity");
let CyclesModule = class CyclesModule {
};
exports.CyclesModule = CyclesModule;
exports.CyclesModule = CyclesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([cycle_entity_1.Cycle, contribution_entity_1.Contribution, tontine_member_entity_1.TontineMember]),
            bull_1.BullModule.registerQueue({ name: 'notifications-queue' }),
        ],
        controllers: [cycles_controller_1.CyclesController],
        providers: [cycles_service_1.CyclesService],
        exports: [cycles_service_1.CyclesService],
    })
], CyclesModule);
//# sourceMappingURL=cycles.module.js.map