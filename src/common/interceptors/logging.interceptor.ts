// ============================================================
// src/common/interceptors/logging.interceptor.ts — Intercepteur de logs
//
// Rôle :
//   - Logue chaque requête entrante : méthode, URL, IP, durée
//   - Logue chaque réponse : status code, durée totale en ms
//   - Attache le requestId (X-Request-ID) à chaque entrée de log
//   - Utilise le Logger NestJS natif
//   - En production : logue au format JSON structuré
// ============================================================
