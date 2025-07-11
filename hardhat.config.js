require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        bscTestnet: {
            url: process.env.BSC_TESTNET_URL,
            accounts: [process.env.DEPLOYER_PRIVATE_KEY],
            chainId: 97,
        },
        bscMainnet: {
            url: process.env.BSC_MAINNET_URL,
            accounts: [process.env.DEPLOYER_PRIVATE_KEY],
            chainId: 56,
        }
    },
    etherscan: {
        apiKey: process.env.BSCSCAN_API_KEY,
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
        verify: "./verify"
    }
};