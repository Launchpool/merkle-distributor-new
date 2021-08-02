const prompt = require('prompt-sync')()
const ERC1155Metadata = require('../artifacts/contracts/test/TestERC1155.sol/TestERC1155.json')

async function main () {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying staking contract with guild using the account:', await deployer.getAddress())

  const tokenAddress = prompt('ERC1155 address? ') // 0x22acaee85ddb83a3a33b7f0928a0e2c3bfdb6a4f
  const merkleRoot = prompt('Merkle root? ') // 0x9d9f8634db1902d10a2615ece779461a69e8fcc57749652d3f8663237c562ede copy from generated json
  const tokenTotals = { '0x00': '0x06', '0x01': '0x01' }

  const tokenInstance = new ethers.Contract(tokenAddress, ERC1155Metadata.abi, deployer)

  console.log('ERC1155 address:', tokenAddress)

  console.log('\nMerkle root:', merkleRoot)

  prompt('If happy, hit enter...')

  const MerkleDistributorFactory = await ethers.getContractFactory('MerkleErc1155Distributor')

  const merkleDistributorInstance = await MerkleDistributorFactory.deploy(tokenAddress, merkleRoot)

  await merkleDistributorInstance.deployed()

  console.log('Claim contract deployed at', merkleDistributorInstance.address)

  const tokenIds = []
  const amounts = []
  for (const tokenId in tokenTotals) {
    tokenIds.push(tokenId)
    amounts.push(tokenTotals[tokenId])

    console.log(`${ethers.BigNumber.from(tokenId)}: ${ethers.BigNumber.from(tokenTotals[tokenId])}`)
  }
  console.log('About to send amount of tokens to claim contract')

  prompt('\nIf happy, hit enter...\n')

  const deployerAddress = await deployer.getAddress()
  console.log('\nMoving tokens from ' + deployerAddress + ' to ' + merkleDistributorInstance.address)
  const tx = await tokenInstance.safeBatchTransferFrom(
    deployerAddress,
    merkleDistributorInstance.address,
    tokenIds,
    amounts,
    0x0
  )
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
