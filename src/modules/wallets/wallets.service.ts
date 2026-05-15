import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

import { Wallet } from './entities/wallet.entity';
import { UsersService } from '../users/users.service';
import { encryptPrivateKey, decryptPrivateKey } from '../../common/utils/crypto.util';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  private get encryptionKey(): string {
    const key = this.configService.get<string>('WALLET_ENCRYPTION_KEY');
    if (!key) throw new Error('WALLET_ENCRYPTION_KEY non configuré dans .env');
    return key;
  }

  private get rpcUrl(): string {
    return this.configService.get<string>('POLYGON_RPC_URL', 'https://rpc-mumbai.maticvigil.com');
  }

  // ──────────────────────────────────────────────
  // POST /wallets/create
  // ──────────────────────────────────────────────
  async createWallet(userId: string): Promise<{ wallet_address: string; network: string }> {
    // Vérifier si un wallet existe déjà
    const existing = await this.walletRepo.findOne({ where: { user_id: userId } });
    if (existing) {
      throw new ConflictException('Un wallet existe déjà pour cet utilisateur');
    }

    // Générer une nouvelle paire de clés Ethereum
    const wallet = ethers.Wallet.createRandom();

    // Chiffrer la clé privée en AES-256-GCM
    const encryptedKey = encryptPrivateKey(wallet.privateKey, this.encryptionKey);

    const newWallet = this.walletRepo.create({
      user_id: userId,
      wallet_address: wallet.address,
      encrypted_private_key: encryptedKey,
      network: this.configService.get<string>('POLYGON_NETWORK', 'polygon-mumbai'),
    });

    await this.walletRepo.save(newWallet);

    // Mettre à jour le champ wallet_address sur l'entité User
    await this.usersService.updateWallet(userId, wallet.address);

    return {
      wallet_address: wallet.address,
      network: newWallet.network,
    };
  }

  // ──────────────────────────────────────────────
  // GET /wallets/balance
  // ──────────────────────────────────────────────
  async getBalance(userId: string): Promise<{
    wallet_address: string;
    balance_matic: string;
    network: string;
  }> {
    const walletRecord = await this.walletRepo.findOne({ where: { user_id: userId } });
    if (!walletRecord) {
      throw new NotFoundException('Wallet introuvable pour cet utilisateur');
    }

    const provider = new ethers.JsonRpcProvider(this.rpcUrl);
    const rawBalance = await provider.getBalance(walletRecord.wallet_address);

    return {
      wallet_address: walletRecord.wallet_address,
      balance_matic: ethers.formatEther(rawBalance), // Converti de wei → MATIC
      network: walletRecord.network,
    };
  }

  // ──────────────────────────────────────────────
  // Usage interne uniquement (ne jamais exposer en HTTP)
  // ──────────────────────────────────────────────
  async createWalletForUser(userId: string): Promise<Wallet> {
    const existing = await this.walletRepo.findOne({ where: { user_id: userId } });
    if (existing) return existing;

    const wallet = ethers.Wallet.createRandom();
    const encryptedKey = encryptPrivateKey(wallet.privateKey, this.encryptionKey);

    const newWallet = this.walletRepo.create({
      user_id: userId,
      wallet_address: wallet.address,
      encrypted_private_key: encryptedKey,
      network: this.configService.get<string>('POLYGON_NETWORK', 'polygon-mumbai'),
    });

    const saved = await this.walletRepo.save(newWallet);
    await this.usersService.updateWallet(userId, wallet.address);
    return saved;
  }

  async getDecryptedPrivateKey(userId: string): Promise<string> {
    const walletRecord = await this.walletRepo.findOne({ where: { user_id: userId } });
    if (!walletRecord) throw new NotFoundException('Wallet introuvable');
    return decryptPrivateKey(walletRecord.encrypted_private_key, this.encryptionKey);
  }
}
