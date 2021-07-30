const prompt = require('prompt-sync')()
const ERC20Metadata = require('../artifacts/contracts/test/TestERC20.sol/TestERC20.json')
const MerkleDistributor = require('../artifacts/contracts/MerkleDistributor.sol/MerkleDistributor.json')

async function main () {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying staking contract with guild using the account:', await deployer.getAddress())

  const tokenAddress = prompt('Token address? ') // 0x22acaee85ddb83a3a33b7f0928a0e2c3bfdb6a4f
  const merkleRoot = prompt('Merkle root? ') // 0x9d9f8634db1902d10a2615ece779461a69e8fcc57749652d3f8663237c562ede copy from generated json
  const maxTokens = prompt('Max tokens? ') // 0x0536a73e41382f311dd8 copy from generated json

  const tokenInstance = new ethers.Contract(tokenAddress, ERC20Metadata.abi, deployer)
  const decimals = await tokenInstance.decimals()
  console.log('\nToken address:', tokenAddress)
  console.log('\nToken symbol: ', await tokenInstance.symbol())
  console.log('\nToken decimals: ', decimals)

  console.log('\nMerkle root:', merkleRoot)
  console.log('\nMax tokens:', ethers.BigNumber.from(maxTokens).toString())

  prompt('If happy, hit enter...')

  const MerkleDistributorFactory = await ethers.getContractFactory('MerkleDistributor')

  const merkleDistributorInstance = await MerkleDistributorFactory.deploy(tokenAddress, merkleRoot)

  await merkleDistributorInstance.deployed()

  console.log('Claim contract deployed at', merkleDistributorInstance.address)

  console.log('About to send amount of tokens to claim contract:', ethers.BigNumber.from(maxTokens).toString())

  prompt('\nIf happy, hit enter...\n')

  const deployerAddress = await deployer.getAddress()
  console.log('\nMoving tokens from ' + deployerAddress + ' to ' + merkleDistributorInstance.address)
  const tx = await tokenInstance.transfer(merkleDistributorInstance.address, maxTokens)
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
