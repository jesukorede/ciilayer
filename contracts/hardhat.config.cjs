require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

const HEDERA_RPC_URL = process.env.HEDERA_RPC_URL || process.env.RPC_URL || "";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";
const CHAIN_ID = Number(process.env.CHAIN_ID || 0);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    hederaTestnet: {
      url: HEDERA_RPC_URL,
      chainId: CHAIN_ID || 296,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
