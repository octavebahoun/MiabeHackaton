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
const config_1 = require("@nestjs/config");
const ethers_1 = require("ethers");
const wallet_entity_1 = require("./entities/wallet.entity");
const users_service_1 = require("../users/users.service");
const crypto_util_1 = require("../../common/utils/crypto.util");
let WalletsService = class WalletsService {
    constructor(walletRepo, configService, usersService) {
        this.walletRepo = walletRepo;
        this.configService = configService;
        this.usersService = usersService;
    }
    get encryptionKey() {
        const key = this.configService.get('WALLET_ENCRYPTION_KEY');
        if (!key)
            throw new Error('WALLET_ENCRYPTION_KEY non configuré dans .env');
        return key;
    }
    get rpcUrl() {
        return this.configService.get('POLYGON_RPC_URL', 'https://rpc-mumbai.maticvigil.com');
    }
    async createWallet(userId) {
        const existing = await this.walletRepo.findOne({ where: { user_id: userId } });
        if (existing) {
            throw new common_1.ConflictException('Un wallet existe déjà pour cet utilisateur');
        }
        const wallet = ethers_1.ethers.Wallet.createRandom();
        const encryptedKey = (0, crypto_util_1.encryptPrivateKey)(wallet.privateKey, this.encryptionKey);
        const newWallet = this.walletRepo.create({
            user_id: userId,
            wallet_address: wallet.address,
            encrypted_private_key: encryptedKey,
            network: this.configService.get('POLYGON_NETWORK', 'polygon-mumbai'),
        });
        await this.walletRepo.save(newWallet);
        await this.usersService.updateWallet(userId, wallet.address);
        return {
            wallet_address: wallet.address,
            network: newWallet.network,
        };
    }
    async getBalance(userId) {
        const walletRecord = await this.walletRepo.findOne({ where: { user_id: userId } });
        if (!walletRecord) {
            throw new common_1.NotFoundException('Wallet introuvable pour cet utilisateur');
        }
        const provider = new ethers_1.ethers.JsonRpcProvider(this.rpcUrl);
        const rawBalance = await provider.getBalance(walletRecord.wallet_address);
        return {
            wallet_address: walletRecord.wallet_address,
            balance_matic: ethers_1.ethers.formatEther(rawBalance),
            network: walletRecord.network,
        };
    }
    async createWalletForUser(userId) {
        const existing = await this.walletRepo.findOne({ where: { user_id: userId } });
        if (existing)
            return existing;
        const wallet = ethers_1.ethers.Wallet.createRandom();
        const encryptedKey = (0, crypto_util_1.encryptPrivateKey)(wallet.privateKey, this.encryptionKey);
        const newWallet = this.walletRepo.create({
            user_id: userId,
            wallet_address: wallet.address,
            encrypted_private_key: encryptedKey,
            network: this.configService.get('POLYGON_NETWORK', 'polygon-mumbai'),
        });
        const saved = await this.walletRepo.save(newWallet);
        await this.usersService.updateWallet(userId, wallet.address);
        return saved;
    }
    async getDecryptedPrivateKey(userId) {
        const walletRecord = await this.walletRepo.findOne({ where: { user_id: userId } });
        if (!walletRecord)
            throw new common_1.NotFoundException('Wallet introuvable');
        return (0, crypto_util_1.decryptPrivateKey)(walletRecord.encrypted_private_key, this.encryptionKey);
    }
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService,
        users_service_1.UsersService])
], WalletsService);
//# sourceMappingURL=wallets.service.js.map