// ============================================================
// src/config/database.config.ts — Configuration PostgreSQL / TypeORM
//
// Rôle :
//   - Configure la connexion TypeORM vers PostgreSQL 16
//   - Expose : host, port, username, password, database
//   - Active les migrations automatiques en production
//   - Enregistre toutes les entités du projet (User, Tontine,
//     TontineMember, Cycle, Contribution)
//   - Configure le logging SQL en développement
//   - Utilisé par TypeOrmModule.forRootAsync() dans app.module.ts
// ============================================================
