// ============================================================
// src/modules/users/dto/update-user.dto.ts — DTO mise à jour profil
//
// Rôle :
//   - Valide le body de PATCH /users/me
//   - Tous les champs sont optionnels (PartialType ou @IsOptional)
//   - Champs autorisés : full_name (string), email (@IsEmail)
//   - Champs interdits en auto-update : phone, role, credit_score, wallet_address
//   - Décrit avec @ApiPropertyOptional() pour Swagger
// ============================================================
