// SPDX-License-Identifier: MIT
// ============================================================
// contracts/TontineRegistry.sol — Registre global des tontines
//
// Rôle :
//   - Contrat unique déployé une seule fois par l'équipe TontineChain
//   - Maintient un registre de tous les TontineVault.sol déployés
//   - Fonctions principales :
//       register(bytes32 tontineId, address vaultAddress)
//           → Enregistre une nouvelle tontine et son vault (onlyOwner)
//       getVault(bytes32 tontineId)
//           → Retourne l'adresse du vault pour une tontine donnée
//       isRegistered(bytes32 tontineId)
//           → Vérifie si une tontine est bien enregistrée
//       getAllTontines()
//           → Retourne la liste de toutes les tontines enregistrées
//   - Sécurité :
//       Ownable : seul le deployer (backend wallet) peut enregistrer
//       Mapping bytes32 → address pour les lookups O(1)
//   - Émet des événements :
//       TontineRegistered(bytes32 tontineId, address vaultAddress)
// ============================================================
pragma solidity ^0.8.0;
