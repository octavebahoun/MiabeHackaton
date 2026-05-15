// ============================================================
// src/common/middleware/request-id.middleware.ts
//
// Rôle :
//   - Génère un identifiant unique UUID v4 pour chaque requête entrante
//   - Injecte cet ID dans le header X-Request-ID de la requête
//   - Retourne également X-Request-ID dans la réponse
//   - Permet la traçabilité de bout en bout de chaque appel API
//     (logs, monitoring, support client, débogage en production)
// ============================================================
