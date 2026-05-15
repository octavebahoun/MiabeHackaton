// ============================================================
// src/config/blockchain.config.ts — Configuration Polygon / ethers.js
//
// Rôle :
//   - Configure le provider ethers.js vers le RPC Polygon (Mumbai / Mainnet)
//   - Expose : POLYGON_RPC_URL, BACKEND_WALLET_PRIVATE_KEY,
//              REGISTRY_CONTRACT_ADDRESS, WALLET_ENCRYPTION_KEY
//   - Configure les providers de failover (QuickNode, Alchemy, RPC public)
//   - Définit les timeouts de transaction (3 min) et le nombre de retries
//   - Expose l'adresse du contrat TontineRegistry déployé
// ============================================================
