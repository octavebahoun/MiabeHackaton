// ============================================================
// src/modules/admin/admin.controller.ts — Contrôleur Admin
//
// Rôle :
//   Expose les endpoints d'administration (ADMIN / SUPER_ADMIN uniquement) :
//
//   GET  /admin/stats          → Statistiques globales (users, tontines, volume XOF)
//   GET  /admin/users          → Liste tous les utilisateurs (paginée)
//   GET  /admin/tontines       → Liste toutes les tontines avec statuts
//   POST /admin/blockchain/retry/:id → Relance manuellement un job blockchain échoué
//   GET  /admin/health         → État détaillé de tous les services
//
//   Toutes les routes sont protégées par @Roles(Role.ADMIN, Role.SUPER_ADMIN)
// ============================================================
