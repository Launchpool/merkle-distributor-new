const prompt = require('prompt-sync')()
const MerkleDistributor = require('../artifacts/contracts/MerkleErc1155Distributor.sol/MerkleErc1155Distributor.json')
const Erc1155 = require('../abi/LaunchPoolErc1155.json')
const LPOOL_ERC1155_ADDRESS = '0xDE508B1313367309360ddd5F0F416c42102a0eEf'
const LPOOL_ERC1155_BSC_ADDRESS = '0x7A3c1a95fF81819eAdB5b8D9Ca0D86891eD340Ed'
async function main () {
  const [deployer] = await ethers.getSigners()
  console.log('Reclaiming using the account:', await deployer.getAddress())

  const address = '0xb4eF54070ACA390BaF2545EAE4b91cbbf2493741'
  const erc1155Address = LPOOL_ERC1155_BSC_ADDRESS
  const tokenId = 2 //bronze = 2
  const deployerAddress = await deployer.getAddress()

  console.log('Transferring remaining from ' + address + ' to ' + deployerAddress + '...')
  const merkleContractInstance = new ethers.Contract(address, MerkleDistributor.abi, deployer)
  const erc1155ContractInstance = new ethers.Contract(erc1155Address, Erc1155.abi, deployer)
  const balance = await erc1155ContractInstance.balanceOf(address, tokenId)
  prompt('\nBalance:' + balance + ', If happy to rescue erc1155, hit enter...')
  const tx = await merkleContractInstance.rescueErc1155Tokens(tokenId, balance)
  await tx.wait()
  console.log('Transferred remaining ' + balance + ' from ' + address + ' to ' + deployerAddress)
  prompt('\nSelf destruct next, If happy hit enter...')
  const tx2 = await merkleContractInstance.selfDestruct()
  await tx2.wait()

  console.log('Finished!')
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
