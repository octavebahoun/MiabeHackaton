// ============================================================
// scripts/deploy.ts — Script de déploiement des smart contracts
//
// Rôle :
//   - Script Hardhat exécuté avec : npx hardhat run scripts/deploy.ts --network mumbai
//   - Étapes du déploiement :
//       1. Déploie TontineRegistry.sol → récupère l'adresse du registre
//       2. Affiche l'adresse à copier dans REGISTRY_CONTRACT_ADDRESS du .env
//       3. Vérifie le contrat sur PolygonScan Mumbai (si ETHERSCAN_API_KEY présent)
//   - Utilise ethers.js fourni par Hardhat
//   - Lit BACKEND_WALLET_PRIVATE_KEY et POLYGON_RPC_URL depuis .env
//   - Note : TontineVault.sol est déployé dynamiquement par le backend
//     (un vault par tontine, pas à la main)
// ============================================================
