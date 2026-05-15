// ============================================================
// src/common/guards/tontine-owner.guard.ts — Guard propriétaire tontine
//
// Rôle :
//   - Vérifie que l'utilisateur connecté est bien l'organisateur
//     de la tontine ciblée par la requête (:id dans l'URL)
//   - Utilisé sur les routes ORGANIZER-only (open, start, valider membres)
//   - Requête DB pour charger la tontine et comparer organizer_id avec user.id
//   - En cas d'échec : retourne 403 FORBIDDEN avec code ORGANIZER_ONLY
// ============================================================
