import { AddressLike, BytesLike, Signer, Wallet, ethers } from 'ethers';
import { MerkleDistributor, MerkleDistributor__factory } from '../typechain-types';
import { network } from 'hardhat';
import { writeAddress } from '../scripts/address-log';

type MerkleDistributorDeploymentParam = {
  token: AddressLike;
  merkleRoot: BytesLike;
  timelockDurationDays: number | string;
  owner: AddressLike;
};

export async function deployMerkleDistributor(
  contractName: string,
  param: MerkleDistributorDeploymentParam,
  signer: Signer | Wallet,
): Promise<MerkleDistributor> {
  console.log(`Deploying ${contractName}...`);

  const { token, merkleRoot, timelockDurationDays, owner } = param;
  const contract = await new MerkleDistributor__factory(signer).deploy(
    token,
    merkleRoot,
    timelockDurationDays,
    owner,
  );

  console.log(
    `${contractName} deployed at ${await contract.getAddress()}. Waiting confirmations...`,
  );
  await contract.waitForDeployment();
  console.log(`${contractName} deployed successfully!\n`);
  await writeAddress(contractName, network.name, await contract.getAddress());

  return contract;
}
