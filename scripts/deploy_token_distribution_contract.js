const prompt = require('prompt-sync')()
const ERC20Metadata = require('../artifacts/contracts/test/TestERC20.sol/TestERC20.json')

async function main () {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying staking contract with guild using the account:', await deployer.getAddress())

  const tokenAddress = '0xfbfae0dd49882e503982f8eb4b8b1e464eca0b91' //prompt('Token address? ') // 0x464FdB8AFFC9bac185A7393fd4298137866DCFB8 //Realm
  const merkleRoot = '0xf0abe827681781f33f895e52ddb762c709b4a091da7bc7d46a21052e62d89863' //prompt('Merkle root? ') // 0x4a9cee67f417509bc43e03f3684b1e9fb93f5a741d64d188897efb11418e1966 //copy from generated json
  const maxTokens = '0x0b2f33a4a339cc5ce80e' //prompt('Max tokens? ') // 0x04441230b7ce3795c584 //copy from generated json
  const timelockDays = '1' //prompt('Timelock days? ') // 1

  const tokenInstance = new ethers.Contract(tokenAddress, ERC20Metadata.abi, deployer)
  const decimals = await tokenInstance.decimals()
  const symbol = await tokenInstance.symbol()
  console.log('\nToken address:', tokenAddress)
  console.log('\nToken symbol: ', symbol)
  console.log('\nToken decimals: ', decimals)

  console.log('\nMerkle root:', merkleRoot)
  console.log('\nMax tokens formatted:', ethers.utils.formatUnits(maxTokens, decimals).toString() + ' ' + symbol)

  prompt('If happy, hit enter...')

  const MerkleDistributorFactory = await ethers.getContractFactory('MerkleDistributor')

  const merkleDistributorInstance = await MerkleDistributorFactory.deploy(tokenAddress, merkleRoot, timelockDays)

  await merkleDistributorInstance.deployed()
  const deployedAddress = merkleDistributorInstance.address

  console.log('Claim contract deployed at', deployedAddress)

  console.log('About to send amount of tokens to claim contract:', ethers.BigNumber.from(maxTokens).toString())

  prompt('\nIf happy, hit enter...\n')

  const deployerAddress = await deployer.getAddress()
  console.log('\nMoving tokens from ' + deployerAddress + ' to ' + deployedAddress)
  const tx = await tokenInstance.transfer(deployedAddress, maxTokens)
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
