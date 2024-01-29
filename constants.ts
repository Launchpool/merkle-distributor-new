export const DEPLOY_CONSTANTS = {
  localhost: {
    merkleDistributor: {
      token: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      merkleRoot: '0xf0abe827681781f33f895e52ddb762c709b4a091da7bc7d46a21052e62d89863',
      timelockDurationDays: '0',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    },
    testToken: {
      name: 'Awesome Test Token',
      symbol: 'ATT',
      supply: '1000000',
      decimals: 18,
    },
  },
  arbitrumSepolia: {
    merkleDistributor: {
      token: '0xfbfae0dd49882e503982f8eb4b8b1e464eca0b91',
      merkleRoot: '0xf0abe827681781f33f895e52ddb762c709b4a091da7bc7d46a21052e62d89863',
      timelockDurationDays: '1',
      owner: '0x2F24944AD0b3F5a336654EA0992d17Dd84979abf',
    },
    testToken: {
      name: 'Awesome Test Token',
      symbol: 'ATT',
      supply: '1000000',
      decimals: 18,
    },
  },
};

export const MERKLE_DISTRIBUTORS = {
  localhost: ['0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'],
  arbitrumSepolia: ['0xEdb47e4714834B7Bc2E99F85113b61b9285Da659'],
  mainnet: ['0x08dBcA5d001Faa66F4FFCdfe1CC9680775da896f'],
};
