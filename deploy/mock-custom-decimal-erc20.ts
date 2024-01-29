import { Signer, Wallet } from 'ethers';
import {
  MockCustomDecimalERC20,
  MockCustomDecimalERC20__factory,
  TestERC20,
  TestERC20__factory,
} from '../typechain-types';
import { network } from 'hardhat';
import { writeAddress } from '../scripts/address-log';

type MockCustomDecimalERC20DeploymentParam = {
  name: string;
  symbol: string;
  supply: number | string | bigint;
  decimals: number | string | bigint;
};

export async function deployMockCustomDecimalERC20(
  contractName: string,
  param: MockCustomDecimalERC20DeploymentParam,
  signer: Signer | Wallet,
): Promise<MockCustomDecimalERC20> {
  console.log(`Deploying ${contractName}...`);

  const { name, symbol, supply, decimals } = param;
  const contract = await new MockCustomDecimalERC20__factory(signer).deploy(
    name,
    symbol,
    supply,
    decimals,
  );

  console.log(
    `${contractName} deployed at ${await contract.getAddress()}. Waiting confirmations...`,
  );
  await contract.waitForDeployment();
  console.log(`${contractName} deployed successfully!\n`);
  await writeAddress(contractName, network.name, await contract.getAddress());

  return contract;
}
