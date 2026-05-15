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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const wallet_entity_1 = require("./entities/wallet.entity");
const config_1 = require("@nestjs/config");
const crypto_util_1 = require("../../common/utils/crypto.util");
const ethers_1 = require("ethers");
let WalletsService = class WalletsService {
    constructor(walletRepo, configService) {
        this.walletRepo = walletRepo;
        this.configService = configService;
    }
    async createWalletForUser(userId) {
        const wallet = ethers_1.ethers.Wallet.createRandom();
        const encryptionKey = this.configService.get('WALLET_ENCRYPTION_KEY');
        if (!encryptionKey) {
            throw new Error('WALLET_ENCRYPTION_KEY not configured');
        }
        const encryptedKey = (0, crypto_util_1.encryptPrivateKey)(wallet.privateKey, encryptionKey);
        const newWallet = this.walletRepo.create({
            user_id: userId,
            wallet_address: wallet.address,
            encrypted_private_key: encryptedKey,
            network: this.configService.get('POLYGON_NETWORK', 'polygon-mumbai'),
        });
        return this.walletRepo.save(newWallet);
    }
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], WalletsService);
//# sourceMappingURL=wallets.service.js.map