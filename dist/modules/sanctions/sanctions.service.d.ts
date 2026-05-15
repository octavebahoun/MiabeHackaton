import { ScoreService } from '../score/score.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class SanctionsService {
    private readonly scoreService;
    private readonly notificationsService;
    private readonly logger;
    constructor(scoreService: ScoreService, notificationsService: NotificationsService);
    processLatePayments(tontineId: string, cycleNumber: number, lateUserIds: string[]): Promise<void>;
}
