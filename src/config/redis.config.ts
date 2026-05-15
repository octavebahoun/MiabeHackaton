// ============================================================
// src/config/redis.config.ts — Configuration Redis
//
// Rôle :
//   - Configure la connexion Redis 7 via ioredis
//   - Expose : host, port, password
//   - Utilisé par BullModule (queues asynchrones BullMQ) et
//     par le service de cache JWT blacklist / OTP / sessions
//   - Configure les options de reconnexion automatique
// ============================================================
