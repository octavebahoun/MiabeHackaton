// ============================================================
// src/common/interceptors/response-transform.interceptor.ts
//
// Rôle :
//   - Normalise le format de TOUTES les réponses de succès :
//     { success: true, data: <payload>, meta?: <pagination>, timestamp }
//   - Garantit une API cohérente pour tous les consommateurs
//   - Wrap automatiquement le retour de chaque controller
//   - Ajoute le X-Request-ID dans les headers de réponse
//   - Ne modifie pas les réponses d'erreur (gérées par ExceptionFilter)
// ============================================================
