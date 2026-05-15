// ============================================================
// src/modules/sanctions/sanctions.service.ts — Service Sanctions
//
// Rôle :
//   - detectLateContributions() : job récurrent qui identifie les membres
//                                 qui n'ont pas cotisé avant la deadline du cycle
//   - applyPenalty()            : applique une pénalité (réduction score, frais)
//   - suspendMember()           : suspend temporairement un membre récidiviste
//   - sendLateReminder()        : envoie une notification de rappel via
//                                 NotificationsService avant la deadline
//   - NOTE : Fonctionnalité hors périmètre MVP hackathon (Phase 1 post-hackathon)
// ============================================================
