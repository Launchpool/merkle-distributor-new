const prompt = require('prompt-sync')()
const ERC20Metdata = require('../artifacts/contracts/test/TestERC20.sol/TestERC20.json')
const MerkleDistributor = require('../artifacts/contracts/MerkleDistributor.sol/MerkleDistributor.json')

async function main () {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying staking contract with guild using the account:', await deployer.getAddress())

  const tokenAddress = prompt('Token address? ') // 0x6149C26Cd2f7b5CCdb32029aF817123F6E37Df5B
  const merkleRoot = prompt('Merkle root? ') // copy from generated json
  const maxTokens = prompt('Max tokens? ') // copy from generated json

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

  console.log('\nApproving fund raising contract to move tokens...')
  const deployerAddress = await deployer.getAddress()
  const tx = await tokenInstance.transferFrom(deployerAddress, merkleDistributorInstance.address, maxTokens)
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
