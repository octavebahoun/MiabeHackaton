// ============================================================
// src/common/interceptors/timeout.interceptor.ts — Timeout global
//
// Rôle :
//   - Applique un timeout global de 30 secondes sur toutes les routes
//   - Timeout réduit à 5 secondes sur les routes critiques (paiements)
//   - En cas de dépassement : retourne 408 REQUEST_TIMEOUT
//   - Utilise RxJS timeout() operator
//   - Permet d'éviter les connexions DB bloquées indéfiniment
// ============================================================
