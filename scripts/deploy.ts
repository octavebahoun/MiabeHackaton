import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  console.log("🚀 Démarrage du déploiement de TontineRegistry...");

  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("❌ Aucun compte de déploiement trouvé (BACKEND_WALLET_PRIVATE_KEY manquant).");
  }

  console.log(`📡 Compte de déploiement : ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Solde MATIC : ${ethers.formatEther(balance)} MATIC`);

  const TontineRegistry = await ethers.getContractFactory("TontineRegistry");
  const registry = await TontineRegistry.deploy();

  await registry.waitForDeployment();

  const registryAddress = await registry.getAddress();
  console.log(`✅ TontineRegistry déployé à l'adresse : ${registryAddress}`);
  console.log(`⚠️ ACTION REQUISE: Copiez cette adresse et mettez-la dans REGISTRY_CONTRACT_ADDRESS dans votre fichier .env\n`);
  
  // Exporter l'adresse dans un fichier json
  fs.writeFileSync("registry-address.json", JSON.stringify({ registryAddress }, null, 2));
}

main().catch((error) => {
  console.error("❌ Erreur pendant le déploiement :", error);
  process.exitCode = 1;
});
