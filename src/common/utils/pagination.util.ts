// ============================================================
// src/common/utils/pagination.util.ts — Utilitaires de pagination
//
// Rôle :
//   - buildPaginationMeta() : construit les métadonnées de pagination
//     { page, limit, total, totalPages, hasNext, hasPrev }
//   - buildPaginationQuery() : construit les paramètres skip/take TypeORM
//     depuis les query params (page, limit)
//   - Valide les paramètres de pagination (min/max)
//   - Utilisé par tous les endpoints GET qui retournent des listes
//     (tontines, contributions, membres, cycles...)
// ============================================================
