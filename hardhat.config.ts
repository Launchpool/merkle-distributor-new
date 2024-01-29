import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-gas-reporter';
import 'solidity-docgen';
import 'solidity-coverage';
import 'dotenv/config';

const config: HardhatUserConfig = {
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545/',
    },
    mainnet: {
      url: `${process.env.MAINNET_PROVIDER}`,
      accounts: [`${process.env.MAINNET_PK}`],
    },
    mainnetbsc: {
      url: `https://bsc-dataseed4.binance.org/`,
      accounts: [`${process.env.BSC_MAINNET_PK}`],
    },
    testnetbsc: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
      accounts: [`${process.env.BSC_TESTNET_PK}`],
    },
    arbitrum: {
      url: `${process.env.ARBITRUM_PROVIDER}`,
      accounts: [`${process.env.ARBITRUM_PK}`],
    },
    arbitrumSepolia: {
      url: `${process.env.ARBITRUM_SEPOLIA_PROVIDER}`,
      accounts: [`${process.env.ARBITRUM_SEPOLIA_PK}`],
    },
  },
  solidity: {
    version: '0.8.22',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  gasReporter: {
    enabled: true,
  },
  etherscan: {
    apiKey: process.env.BSCSCAN_API_KEY,
  },
  docgen: {},
};

export default config;
