// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/cryptography/MerkleProof.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Pausable.sol';
import './interfaces/IMerkleDistributor.sol';

contract UpdateableMerkleDistributor is
    // IMerkleDistributor,
    Ownable,
    Pausable
{

    // This event is triggered whenever a call to #claim succeeds.
    event Claimed(uint256 claimId, uint256 index, address account, uint256 amount);

    struct ClaimInfo {
        uint256 timelockDurationDays;
        uint256 timelock;
        uint256 creationTime;
        bytes32 merkleRoot;
        address token;
        bool claimFinished;

    }

    ClaimInfo[] public claims;

    
    
    // claimId => index => claimed ?
    mapping(uint256 => mapping(uint256 => bool)) claimedMap;

    // Merkle Root => is used ?
    mapping(bytes32 => bool) private usedClaim;

    function timelockDurationDays(uint _claimId) public view returns (uint) {
        return claims[_claimId].timelockDurationDays;
    }

    function timelock(uint _claimId) public view returns (uint) {
        return claims[_claimId].timelock;
    }

    function creationTime(uint _claimId) public view returns (uint) {
        return claims[_claimId].creationTime;
    }

    function token(uint _claimId) public view returns (address) {
        return claims[_claimId].token;
    }

    function merkleRoot(uint _claimId) public view returns (bytes32) {
        return claims[_claimId].merkleRoot;
    }

    function claimFinished(uint _claimId) public view returns (bool) {
        return claims[_claimId].claimFinished;
    }

    constructor(address _owner) Ownable(_owner) {}

    function isClaimed(uint256 claimId, uint256 index) public view returns (bool) {
        return claimedMap[claimId][index];
    }

    function addClaim(
        address _token, 
        bytes32 _merkleRoot, 
        uint256 _timelockDurationDays
    ) external onlyOwner {
        require(
            !usedClaim[_merkleRoot],
            'Merkle Root already used'
        );
        claims.push(
            ClaimInfo({
                token: _token,
                merkleRoot: _merkleRoot,
                creationTime: block.timestamp,
                timelockDurationDays: _timelockDurationDays * 1 days,
                timelock: block.timestamp + _timelockDurationDays * 1 days,
                claimFinished: false
            })
        );

        usedClaim[_merkleRoot] = true;
    }

    function claim(
        uint256 claimId,
        uint256 index, 
        address account, 
        uint256 amount, 
        bytes32[] calldata merkleProof
    ) external whenNotPaused() {
        require(!isClaimed(claimId, index), 'MerkleDistributor: Drop already claimed.');
        require(account == msg.sender, 'MerkleDistributor: sender is not claimant.');
        ClaimInfo memory claimInfo = claims[claimId];

        // Verify the merkle proof.
        bytes32 node = keccak256(abi.encodePacked(claimId, index, account, amount));
        require(MerkleProof.verify(merkleProof, claimInfo.merkleRoot, node), 'MerkleDistributor: Invalid proof.');

        // Mark it claimed and send the token.
        claimedMap[claimId][index] = true;
        require(IERC20(claimInfo.token).transfer(account, amount), 'MerkleDistributor: Transfer failed.');

        emit Claimed(claimId, index, account, amount);
    }

    function remainingClaimTime(uint claimId) public view returns (uint256) {
        return claims[claimId].timelock >= block.timestamp ? claims[claimId].timelock - block.timestamp : 0;
    }

    function timelockDuration(uint claimId) public view returns (uint256) {
        return claims[claimId].timelock;
    }

    function rescueTokens(address tokenAddress) public onlyOwner {
        uint256 balance = IERC20(tokenAddress).balanceOf(address(this));
        require(IERC20(tokenAddress).transfer(msg.sender, balance), 'MerkleDistributor: Transfer failed.');
    }

    function transferRemainingToOwner(uint claimId) public onlyOwner whenNotPaused() {
        uint256 balance = IERC20(claims[claimId].token).balanceOf(address(this));

        require(IERC20(claims[claimId].token).transfer(msg.sender, balance), 'MerkleDistributor: Transfer failed.');
    }
}
