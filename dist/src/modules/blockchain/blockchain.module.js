"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const blockchain_service_1 = require("./blockchain.service");
const blockchain_controller_1 = require("./blockchain.controller");
const blockchain_worker_1 = require("./workers/blockchain.worker");
const contribution_entity_1 = require("../contributions/entities/contribution.entity");
const tontine_entity_1 = require("../tontines/entities/tontine.entity");
let BlockchainModule = class BlockchainModule {
};
exports.BlockchainModule = BlockchainModule;
exports.BlockchainModule = BlockchainModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([contribution_entity_1.Contribution, tontine_entity_1.Tontine]),
            bull_1.BullModule.registerQueue({ name: 'blockchain-queue' }),
        ],
        controllers: [blockchain_controller_1.BlockchainController],
        providers: [blockchain_service_1.BlockchainService, blockchain_worker_1.BlockchainWorker],
        exports: [blockchain_service_1.BlockchainService],
    })
], BlockchainModule);
//# sourceMappingURL=blockchain.module.js.map