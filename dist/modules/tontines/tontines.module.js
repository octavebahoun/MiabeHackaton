"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TontinesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const tontines_controller_1 = require("./tontines.controller");
const tontines_service_1 = require("./tontines.service");
const tontines_repository_1 = require("./tontines.repository");
const tontine_entity_1 = require("./entities/tontine.entity");
const tontine_member_entity_1 = require("./entities/tontine-member.entity");
const users_module_1 = require("../users/users.module");
const cycles_module_1 = require("../cycles/cycles.module");
let TontinesModule = class TontinesModule {
};
exports.TontinesModule = TontinesModule;
exports.TontinesModule = TontinesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([tontine_entity_1.Tontine, tontine_member_entity_1.TontineMember]),
            users_module_1.UsersModule,
            (0, common_1.forwardRef)(() => cycles_module_1.CyclesModule),
        ],
        controllers: [tontines_controller_1.TontinesController],
        providers: [tontines_service_1.TontinesService, tontines_repository_1.TontinesRepository],
        exports: [tontines_service_1.TontinesService],
    })
], TontinesModule);
//# sourceMappingURL=tontines.module.js.map