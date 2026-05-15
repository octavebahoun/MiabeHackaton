// ============================================================
// src/common/filters/global-exception.filter.ts — Filtre d'exceptions global
//
// Rôle :
//   - Intercepte TOUTES les exceptions levées dans l'application
//   - Normalise le format de réponse d'erreur :
//     { success: false, error: { code, message, details }, timestamp, requestId }
//   - Gère les cas spécifiques : HttpException, ValidationError,
//     TypeORM QueryFailedError, EntityNotFoundError
//   - Logue les erreurs avec le requestId pour la traçabilité
//   - Masque les détails d'erreur internes en production (NODE_ENV=production)
//   - Retourne 500 pour toutes les erreurs non gérées
// ============================================================
