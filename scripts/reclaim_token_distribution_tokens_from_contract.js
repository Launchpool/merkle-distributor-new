const prompt = require('prompt-sync')()
const MerkleDistributor = require('../artifacts/contracts/MerkleDistributor.sol/MerkleDistributor.json')
const ERC20Metadata = require('../artifacts/contracts/test/TestERC20.sol/TestERC20.json')

async function main () {
  const [deployer] = await ethers.getSigners()
  console.log('Reclaiming using the account:', await deployer.getAddress())

  const addresses = ['0x0224D36267d4fDb65099240e5ABf38752833b897']
  const deployerAddress = await deployer.getAddress()
  for (let x = 0; x < addresses.length; x++) {
    console.log('Transferring remaining from ' + addresses[x] + ' to ' + deployerAddress + '...')
    const merkleContractInstance = new ethers.Contract(addresses[x], MerkleDistributor.abi, deployer)
    const tx = await merkleContractInstance.transferRemainingToOwner()
    await tx.wait()
    console.log('Transferred remaining from ' + addresses[x] + ' to ' + deployerAddress)
  }

  console.log('Finished!')
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
