import { ethers, network } from 'hardhat';
import { DEPLOY_CONSTANTS } from '../constants';
import { deployMerkleDistributor } from '../deploy/merkle-distributor';

async function main() {
  const [signer] = await ethers.getSigners();
  const param = (DEPLOY_CONSTANTS as any)[network.name].merkleDistributor;

  await deployMerkleDistributor('MerkleDistributor', param, signer);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
