import { Injectable, Logger } from '@nestjs/common';
import { ScoreService } from '../score/score.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SanctionsService {
  private readonly logger = new Logger(SanctionsService.name);

  constructor(
    private readonly scoreService: ScoreService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Détecte les retards et applique les sanctions.
   * Cette méthode est appelée par un cron job (CyclesService) lorsqu'un cycle se termine.
   */
  async processLatePayments(tontineId: string, cycleNumber: number, lateUserIds: string[]) {
    this.logger.log(`Traitement des retards pour tontine ${tontineId}, cycle ${cycleNumber}`);

    for (const userId of lateUserIds) {
      // 1. Pénalité sur le score
      await this.scoreService.applyPenalty(userId);

      // 2. Notification de retard (par push ou email)
      // Note: Il faudrait récupérer le token de l'utilisateur, ici on simule l'appel
      await this.notificationsService.queuePush({
        token: 'user_fcm_token_placeholder', // A remplacer par une requête en DB
        title: '⚠️ Retard de Cotisation',
        body: `Vous n'avez pas cotisé à temps pour le cycle ${cycleNumber}. Votre score de crédit a été pénalisé.`,
      });

      this.logger.log(`Utilisateur ${userId} sanctionné pour retard`);
    }
  }
}
