require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    mumbai: {
      url: process.env.POLYGON_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: process.env.BACKEND_WALLET_PRIVATE_KEY ? [process.env.BACKEND_WALLET_PRIVATE_KEY] : [],
    },
    amoy: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-amoy.g.alchemy.com/v2/your_key",
      accounts: process.env.BACKEND_WALLET_PRIVATE_KEY ? [process.env.BACKEND_WALLET_PRIVATE_KEY] : [],
    }
  },
};
