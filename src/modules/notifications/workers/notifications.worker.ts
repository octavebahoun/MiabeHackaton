// ============================================================
// src/modules/notifications/workers/notifications.worker.ts
//
// Rôle :
//   - Consommateur BullMQ de la queue 'notifications-queue'
//   - Traite les jobs de notification de manière asynchrone :
//       'send-sms'  : appelle le provider SMS (Twilio / Africa's Talking / autre)
//       'send-push' : appelle Firebase FCM Admin SDK
//       'send-email': appelle le provider email (hors MVP)
//   - Retry automatique en cas d'échec (max 3 tentatives)
//   - Logue le succès ou l'échec de chaque notification envoyée
// ============================================================
