const prompt = require('prompt-sync')()
const ERC20Metadata = require('../artifacts/contracts/test/TestERC20.sol/TestERC20.json')

async function main () {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying staking contract with guild using the account:', await deployer.getAddress())

  const tokenAddress = prompt('Token address? ') // 0x54f9b4b4485543a815c51c412a9e20436a06491d
  const merkleRoot = prompt('Merkle root? ') // 0x3ea5362874f3ee3727b782abb42f7bf71731417ef8338c825eb4281d8f7c0ce5 copy from generated json
  const maxTokens = prompt('Max tokens? ') // 0xbcca6a0be9378190c000 copy from generated json
  const timelockDays = prompt('Timelock days? ') // 0

  const tokenInstance = new ethers.Contract(tokenAddress, ERC20Metadata.abi, deployer)
  const decimals = await tokenInstance.decimals()
  const symbol = await tokenInstance.symbol()
  console.log('\nToken address:', tokenAddress)
  console.log('\nToken symbol: ', symbol)
  console.log('\nToken decimals: ', decimals)

  console.log('\nMerkle root:', merkleRoot)
  console.log('\nMax tokens formatted:', ethers.utils.formatUnits(maxTokens, decimals).toString()+" "+ symbol)

  prompt('If happy, hit enter...')

  const MerkleDistributorFactory = await ethers.getContractFactory('MerkleDistributor')

  const merkleDistributorInstance = await MerkleDistributorFactory.deploy(tokenAddress, merkleRoot, timelockDays)

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
