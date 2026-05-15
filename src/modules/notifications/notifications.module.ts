// ============================================================
// src/modules/notifications/notifications.module.ts — Module Notifications
//
// Rôle :
//   - Configure BullModule.registerQueue({ name: 'notifications-queue' })
//   - Configure HttpModule pour les appels Firebase FCM et SMS provider
//   - Déclare : NotificationsService, NotificationsWorker
//   - Exporte NotificationsService (utilisé par Auth, Tontines, Contributions)
//   - Les notifications sont toujours envoyées de manière asynchrone via BullMQ
// ============================================================
