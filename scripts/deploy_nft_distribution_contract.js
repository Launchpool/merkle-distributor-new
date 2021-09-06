const prompt = require('prompt-sync')()
const ERC1155Metadata = require('../abi/LaunchPoolErc1155.json')
const LPOOL_ERC1155_ADDRESS = '0xDE508B1313367309360ddd5F0F416c42102a0eEf'
const LPOOL_ERC1155_BSC_ADDRESS = '0x7A3c1a95fF81819eAdB5b8D9Ca0D86891eD340Ed'
async function main () {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying staking contract with guild using the account:', await deployer.getAddress())

  const tokenAddress = prompt('ERC1155 address? ') // 0x7A3c1a95fF81819eAdB5b8D9Ca0D86891eD340Ed
  const merkleRoot = prompt('Merkle root? ') // 0x2758d19f248fbfd16ff987f9da0ad10a909655f7d60dce02084416e62e9a3226 copy from generated json
  const tokenId = prompt('Token Id? ') // 0x02
  const amount = prompt('Amount to mint? ') // 0x10ed

  const tokenInstance = new ethers.Contract(tokenAddress, ERC1155Metadata.abi, deployer)

  console.log('ERC1155 address:', tokenAddress)

  console.log('\nMerkle root:', merkleRoot)
  console.log('\nToken Id:', tokenId)
  console.log('\nAmount:', amount)

  prompt('If happy, hit enter...')

  const MerkleDistributorFactory = await ethers.getContractFactory('MerkleErc1155Distributor')

  const merkleDistributorInstance = await MerkleDistributorFactory.deploy(tokenAddress, merkleRoot)

  await merkleDistributorInstance.deployed()

  console.log('Claim contract deployed at', merkleDistributorInstance.address)

  console.log('About to mint tokens to claim contract')

  prompt('\nIf happy, hit enter...\n')

  const deployerAddress = await deployer.getAddress()
  console.log('\nMinting tokens from ' + deployerAddress + ' to ' + merkleDistributorInstance.address)
  const tx = await tokenInstance.mint(merkleDistributorInstance.address, tokenId, amount)
  await tx.wait()

  console.log('Done!')

  console.log('Finished!')
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
