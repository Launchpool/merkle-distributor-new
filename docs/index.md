# Solidity API

## MerkleDistributor

### timelockDurationDays

```solidity
uint256 timelockDurationDays
```

### timelock

```solidity
uint256 timelock
```

### creationTime

```solidity
uint256 creationTime
```

### isClaimingPaused

```solidity
bool isClaimingPaused
```

### token

```solidity
address token
```

### merkleRoot

```solidity
bytes32 merkleRoot
```

### notLocked

```solidity
modifier notLocked()
```

### constructor

```solidity
constructor(address token_, bytes32 merkleRoot_, uint256 timelockDurationDays_, address owner_) public
```

### claim

```solidity
function claim(uint256 index, address account, uint256 amount, bytes32[] merkleProof) external
```

### setClaimingPaused

```solidity
function setClaimingPaused(bool paused) external
```

### rescueTokens

```solidity
function rescueTokens(address tokenAddress) external
```

### transferRemainingToOwner

```solidity
function transferRemainingToOwner() external
```

### remainingClaimTime

```solidity
function remainingClaimTime() external view returns (uint256)
```

### isClaimed

```solidity
function isClaimed(uint256 index) public view returns (bool)
```

## UpdateableMerkleDistributor

### Claimed

```solidity
event Claimed(uint256 claimId, uint256 index, address account, uint256 amount)
```

### ClaimInfo

```solidity
struct ClaimInfo {
  uint256 timelockDurationDays;
  uint256 timelock;
  uint256 creationTime;
  bytes32 merkleRoot;
  address token;
  bool claimFinished;
}
```

### claims

```solidity
struct UpdateableMerkleDistributor.ClaimInfo[] claims
```

### claimedMap

```solidity
mapping(uint256 => mapping(uint256 => bool)) claimedMap
```

### timelockDurationDays

```solidity
function timelockDurationDays(uint256 _claimId) public view returns (uint256)
```

### timelock

```solidity
function timelock(uint256 _claimId) public view returns (uint256)
```

### creationTime

```solidity
function creationTime(uint256 _claimId) public view returns (uint256)
```

### token

```solidity
function token(uint256 _claimId) public view returns (address)
```

### merkleRoot

```solidity
function merkleRoot(uint256 _claimId) public view returns (bytes32)
```

### claimFinished

```solidity
function claimFinished(uint256 _claimId) public view returns (bool)
```

### constructor

```solidity
constructor(address _owner) public
```

### isClaimed

```solidity
function isClaimed(uint256 claimId, uint256 index) public view returns (bool)
```

### addClaim

```solidity
function addClaim(address _token, bytes32 _merkleRoot, uint256 _timelockDurationDays) external
```

### claim

```solidity
function claim(uint256 claimId, uint256 index, address account, uint256 amount, bytes32[] merkleProof) external
```

### remainingClaimTime

```solidity
function remainingClaimTime(uint256 claimId) public view returns (uint256)
```

### timelockDuration

```solidity
function timelockDuration(uint256 claimId) public view returns (uint256)
```

### rescueTokens

```solidity
function rescueTokens(address tokenAddress) public
```

### transferRemainingToOwner

```solidity
function transferRemainingToOwner(uint256 claimId) public
```

## IMerkleDistributor

### token

```solidity
function token() external view returns (address)
```

### merkleRoot

```solidity
function merkleRoot() external view returns (bytes32)
```

### isClaimed

```solidity
function isClaimed(uint256 index) external view returns (bool)
```

### claim

```solidity
function claim(uint256 index, address account, uint256 amount, bytes32[] merkleProof) external
```

### Claimed

```solidity
event Claimed(uint256 index, address account, uint256 amount)
```

## MockCustomDecimalERC20

### constructor

```solidity
constructor(string name, string symbol, uint256 _supply, uint8 _decimals) public
```

### mint

```solidity
function mint(address _to, uint256 _amount) public
```

## TestERC20

### constructor

```solidity
constructor(string name_, string symbol_, uint256 amountToMint) public
```

### setBalance

```solidity
function setBalance(address to, uint256 amount) public
```

