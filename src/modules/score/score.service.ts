import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class ScoreService {
  private readonly logger = new Logger(ScoreService.name);

  constructor(private readonly usersService: UsersService) {}

  /**
   * Augmente le score de crédit d'un utilisateur après une cotisation réussie.
   * Règle MVP : +5 points par cotisation payée à temps. Max 1000.
   */
  async addPositiveScore(userId: string): Promise<void> {
    this.logger.log(`Ajout de points positifs pour l'utilisateur ${userId}`);
    // Ici on devrait mettre à jour l'entité User (ajout de credit_score dans l'entité)
    // Pour le MVP, on simule l'appel si le champ existe, sinon on log.
    try {
      const user = await this.usersService.findById(userId);
      const currentScore = user.credit_score || 500;
      const newScore = Math.min(1000, currentScore + 5);
      
      await this.usersService.updateCreditScore(userId, newScore);
      this.logger.log(`Nouveau score calculé : ${newScore}`);
    } catch (e) {
      this.logger.error(`Erreur maj score : ${e.message}`);
    }
  }

  /**
   * Diminue le score de crédit d'un utilisateur après un retard.
   * Règle MVP : -20 points par retard de cotisation. Min 0.
   */
  async applyPenalty(userId: string): Promise<void> {
    this.logger.warn(`Pénalité appliquée au score de l'utilisateur ${userId}`);
    try {
      const user = await this.usersService.findById(userId);
      const currentScore = user.credit_score || 500;
      const newScore = Math.max(0, currentScore - 20);
      
      await this.usersService.updateCreditScore(userId, newScore);
      this.logger.log(`Nouveau score suite à pénalité : ${newScore}`);
    } catch (e) {
      this.logger.error(`Erreur pénalité score : ${e.message}`);
    }
  }
}
