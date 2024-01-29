import { ethers, network } from 'hardhat';
import { DEPLOY_CONSTANTS } from '../constants';
import { deployMockCustomDecimalERC20 } from '../deploy/mock-custom-decimal-erc20';

async function main() {
  const [signer] = await ethers.getSigners();
  const param = (DEPLOY_CONSTANTS as any)[network.name].testToken;

  await deployMockCustomDecimalERC20('MockCustomDecimalERC20', param, signer);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
