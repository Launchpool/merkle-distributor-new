import { ethers, network } from 'hardhat';
import { MERKLE_DISTRIBUTORS } from '../constants';
import { MerkleDistributor__factory } from '../typechain-types';

async function main() {
  const [signer] = await ethers.getSigners();
  const addresses = (MERKLE_DISTRIBUTORS as any)[network.name];

  for (let address of addresses) {
    console.log('Transferring remaining from ' + address + ' to ' + signer.address + '...');
    const merkleContractInstance = MerkleDistributor__factory.connect(address, signer);
    const tx = await merkleContractInstance.transferRemainingToOwner();
    await tx.wait();
    console.log('Transferred remaining from ' + address + ' to ' + signer.address);
  }
  console.log('Finished!');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
