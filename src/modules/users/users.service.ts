import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findByPhone(phone);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('USER_NOT_FOUND');
    return user;
  }

  async create(data: Partial<User>): Promise<User> {
    return this.usersRepository.create(data);
  }

  /** Active le compte après vérification OTP */
  async activate(id: string): Promise<void> {
    await this.usersRepository.updateById(id, {
      is_active: true,
      phone_verified: true,
    });
  }

  /** Enregistre l'adresse wallet Polygon après création */
  async updateWallet(id: string, walletAddress: string): Promise<void> {
    await this.usersRepository.updateById(id, { wallet_address: walletAddress });
  }

  async updateProfile(id: string, data: { full_name?: string; email?: string }): Promise<User> {
    await this.usersRepository.updateById(id, data);
    return this.findById(id);
  }

  async updateCreditScore(id: string, score: number): Promise<void> {
    await this.usersRepository.updateById(id, { credit_score: score });
  }

  async updateKycStatus(id: string, status: any): Promise<void> {
    await this.usersRepository.updateById(id, { kyc_status: status });
  }

  async blockUser(id: string): Promise<void> {
    await this.usersRepository.updateById(id, { is_active: false });
  }

  /**
   * GET /users/:id/score
   * Retourne le score de fiabilité d'un utilisateur.
   * Le score est calculé par le ScoreService en fond et mis à jour en DB.
   * Ici on le lit directement (lecture rapide, pas de calcul à la volée).
   */
  async getScoreById(userId: string, targetUserId: string): Promise<{
    user_id: string;
    full_name: string;
    score: number;
    level: string;
    total_contributions: number;
    on_time: number;
    late: number;
    completed_tontines: number;
  }> {
    const target = await this.findById(targetUserId);

    // Attribution d'un label lisible selon le score
    let score_label: string;
    const score = Number(target.credit_score ?? 0);

    if (score >= 90)      score_label = 'Excellent';
    else if (score >= 70) score_label = 'Bon';
    else if (score >= 50) score_label = 'Moyen';
    else if (score >= 30) score_label = 'Faible';
    else                  score_label = 'Très faible';

    return {
      user_id: target.id,
      full_name: target.full_name,
      score: score,
      level: score_label.toUpperCase(),
      total_contributions: 0, // Placeholder
      on_time: 0,            // Placeholder
      late: 0,               // Placeholder
      completed_tontines: 0, // Placeholder
    };
  }
}
