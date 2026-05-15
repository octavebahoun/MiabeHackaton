// SPDX-License-Identifier: MIT
// ============================================================
// contracts/TontineVault.sol — Contrat principal d'une tontine
//
// Rôle :
//   - Un contrat par tontine, déployé par le backend au démarrage
//   - Stocke on-chain les preuves de cotisation (proofHash)
//     proofHash = keccak256(abi.encodePacked(contributionId, amount, timestamp))
//   - Fonctions principales :
//       recordContribution(cycleNumber, memberAddress, proofHash)
//           → Enregistre une preuve de cotisation (onlyBackend)
//       getContributions(cycleNumber)
//           → Retourne toutes les preuves d'un cycle
//       isContributionRecorded(cycleNumber, memberAddress)
//           → Vérifie si un membre a cotisé pour un cycle donné
//       payoutBeneficiary(cycleNumber, beneficiary, amount)
//           → Déclenche le versement au bénéficiaire du cycle (onlyBackend)
//   - Sécurité :
//       modifier onlyBackend : seul le wallet backend peut écrire
//       ReentrancyGuard : protection contre les attaques de réentrance
//       Pausable : permet de geler le contrat en cas d'urgence
//   - Hérite de : Ownable, ReentrancyGuard, Pausable (OpenZeppelin)
//   - Émet des événements :
//       ContributionRecorded(cycleNumber, memberAddress, proofHash)
//       BeneficiaryPaid(cycleNumber, beneficiary, amount)
// ============================================================
pragma solidity ^0.8.0;
