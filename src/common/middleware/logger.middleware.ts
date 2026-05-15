// ============================================================
// src/common/middleware/logger.middleware.ts
//
// Rôle :
//   - Logue chaque requête HTTP entrante avec :
//       méthode (GET/POST...), URL, IP client, user-agent
//   - Logue la durée de traitement à la fin de chaque requête
//   - Inclut le X-Request-ID dans chaque entrée de log
//   - Format JSON en production, format lisible en développement
//   - Utilisé comme middleware global dans app.module.ts
// ============================================================
