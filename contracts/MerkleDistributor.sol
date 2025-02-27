// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IMerkleDistributor.sol";

contract MerkleDistributor is IMerkleDistributor, Ownable {
    uint256 public timelockDurationDays;
    uint256 public timelock;
    uint256 public creationTime;
    bool public isClaimingPaused;

    address public immutable override token;
    bytes32 public immutable override merkleRoot;

    // This is a packed array of booleans.
    mapping(uint256 => uint256) private claimedBitMap;

    modifier notLocked() {
        require(timelock <= block.timestamp, "Function is timelocked");
        _;
    }

    constructor(address token_, bytes32 merkleRoot_, uint256 timelockDurationDays_, address owner_) Ownable(owner_) {
        token = token_;
        merkleRoot = merkleRoot_;
        creationTime = block.timestamp;
        timelockDurationDays = timelockDurationDays_ * 1 days;
        timelock = creationTime + timelockDurationDays;
    }

    function claim(uint256 index, address account, uint256 amount, bytes32[] calldata merkleProof) external override {
        require(!isClaimed(index), "MerkleDistributor: Drop already claimed.");
        require(account == msg.sender, "MerkleDistributor: sender is not claimant.");
        require(!isClaimingPaused, "MerkleDistributor: Cannot claim while claiming is paused");

        // Verify the merkle proof.
        bytes32 node = keccak256(abi.encodePacked(index, account, amount));
        require(MerkleProof.verify(merkleProof, merkleRoot, node), "MerkleDistributor: Invalid proof.");

        // Mark it claimed and send the token.
        _setClaimed(index);
        require(IERC20(token).transfer(account, amount), "MerkleDistributor: Transfer failed.");

        emit Claimed(index, account, amount);
    }

    function setClaimingPaused(bool paused) external onlyOwner {
        isClaimingPaused = paused;
    }

    function rescueTokens(address tokenAddress) external onlyOwner {
        require(tokenAddress != token, "No cheating");
        uint256 balance = IERC20(tokenAddress).balanceOf(address(this));
        require(IERC20(tokenAddress).transfer(msg.sender, balance), "MerkleDistributor: Transfer failed.");
    }

    function transferRemainingToOwner() external onlyOwner notLocked {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(IERC20(token).transfer(msg.sender, balance), "MerkleDistributor: Transfer failed.");
    }

    function remainingClaimTime() external view returns (uint256) {
        return timelock >= block.timestamp ? timelock - block.timestamp : 0;
    }

    function isClaimed(uint256 index) public view override returns (bool) {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        uint256 claimedWord = claimedBitMap[claimedWordIndex];
        uint256 mask = (1 << claimedBitIndex);
        return claimedWord & mask == mask;
    }

    function _setClaimed(uint256 index) private {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        claimedBitMap[claimedWordIndex] = claimedBitMap[claimedWordIndex] | (1 << claimedBitIndex);
    }
}
