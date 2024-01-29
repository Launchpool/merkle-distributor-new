# LaunchPool Merkle Distributor

> Fork from @uniswap/merkle-distributor

[![Tests](https://github.com/Uniswap/merkle-distributor/workflows/Tests/badge.svg)](https://github.com/Uniswap/merkle-distributor/actions?query=workflow%3ATests)
[![Lint](https://github.com/Uniswap/merkle-distributor/workflows/Lint/badge.svg)](https://github.com/Uniswap/merkle-distributor/actions?query=workflow%3ALint)

## Project requirements

- Yarn ≥ v1.22.0
- Node ≥ v16.0.0

## Before start...

1. Install all modules using `yarn`
2. Create `.env` file and complete it with your variables according to `.env.example`
3. Add new networks and other settings in `hardhat.config.ts`

## Project Structure

This repository consists of the following folders:

- `addresses` - used for storing addresses of the contracts in JSON format segregated by the network
- `contracts` - utilized for storing smart contracts written in Solidity as `.sol` files
- `deploy` - contains exported functions for smart contract deployment, each contract should have its own TS file for this purpose
- `docs` - holds docgen and other artifacts relevant for smart contract documentation
- `mock` - holds mock data for claims generation
- `scripts` - contains entry-point files for smart contract deployment and address logging, can be augmented with new script files correspondingly
- `src` - holds classes and routines for building merkle trees from blobs of data and generating corresponding proofs
- `test` - contains all modules for smart contract testing
- `typechain-types` - generated contract types by typechain
- `coverage` - the test coverage report

All necessary constants for deployment and web3 communication separated by network name are stored in `./constants.ts`.

---

## Scripts

### Install dependencies

`yarn` or `yarn install`

### Build package

`yarn build`

### Generate merkle root from file

`yarn generate-merkle-root --input <path_to_json>`

### Generate merkle root from example json

`yarn generate-merkle-root:example`

### Split claims by owners and merge in one zip

`yarn split-claims`

### Run local node

`yarn chain`

### Run tests

`yarn test`

### Compile contracts

`yarn compile`

### Deploy test token

`yarn deploy-test-token`

### Deploy merkle distributor

`yarn deploy-token-distribution`

### Perform token reclaim

`yarn reclaim-tokens`

### Get coverage

`yarn coverage`

### Generate docs

`yarn docs`
