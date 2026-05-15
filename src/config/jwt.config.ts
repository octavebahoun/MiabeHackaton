// ============================================================
// src/config/jwt.config.ts — Configuration JWT RS256
//
// Rôle :
//   - Lit les clés RSA (privée + publique) depuis les fichiers PEM
//   - Configure les durées de vie des tokens :
//       access_token  : 15 minutes
//       refresh_token : 7 jours
//   - Utilisé par JwtModule.registerAsync() dans AuthModule
//   - Configure l'algorithme RS256 (asymétrique)
//   - Expose les secrets pour la génération et la vérification des tokens
// ============================================================
