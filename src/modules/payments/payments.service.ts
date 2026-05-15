// ============================================================
// src/modules/payments/payments.service.ts — Service Paiements
//
// Rôle :
//   - initiateCinetPay()     : appelle l'API CinetPay pour initier un paiement
//                              Mobile Money (MTN MoMo / Moov Money)
//                              Retourne : payment_url ou statut d'initiation
//   - verifyCinetPayWebhook(): vérifie la signature HMAC-SHA256 du webhook
//                              + vérifie IP source dans whitelist CinetPay
//   - checkPaymentStatus()   : interroge CinetPay pour vérifier le statut
//                              d'un paiement (polling en cas de webhook manqué)
//   - pollPendingPayments()  : job récurrent (toutes les 5min) qui vérifie
//                              les paiements PENDING depuis plus de 30min
// ============================================================
