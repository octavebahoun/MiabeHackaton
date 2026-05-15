// ============================================================
// src/modules/score/score.service.ts — Service Score de fiabilité
//
// Rôle :
//   - calculateScore() : recalcule le credit_score d'un utilisateur
//                        après chaque cotisation confirmée
//     Algorithme V1 :
//       Base : 500 points
//       +20 points par cotisation confirmée dans les délais
//       -50 points par cotisation en retard
//       +100 points par tontine complétée
//       Score final : [0 - 1000]
//     Niveaux :
//       0-400   : INSUFFISANT
//       401-600 : MOYEN
//       601-800 : BON
//       801-1000: EXCELLENT
//   - getScoreMetrics() : retourne les métriques détaillées
//     { credit_score, level, total, on_time, late, tontines_completed }
// ============================================================
