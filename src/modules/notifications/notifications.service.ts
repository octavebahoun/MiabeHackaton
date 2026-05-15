// ============================================================
// src/modules/notifications/notifications.service.ts — Service Notifications
//
// Rôle :
//   - sendSms()         : envoie un SMS via le provider configuré
//                         (utilisé pour OTP, alertes paiement)
//   - sendPush()        : envoie une notification push via Firebase FCM
//   - sendEmail()       : envoie un email (optionnel, hors MVP hackathon)
//   - queueNotification(): ajoute un job dans 'notifications-queue' BullMQ
//                          (toutes les notifications passent par la queue)
//   - Notifications clés :
//       OTP inscription, tontine démarrée, cotisation confirmée,
//       cycle terminé, rappel cotisation, retard détecté
// ============================================================
