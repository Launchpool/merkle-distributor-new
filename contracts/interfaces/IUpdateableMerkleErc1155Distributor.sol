// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;

// Allows anyone to claim a token if they exist in a merkle root.
interface IUpdateableMerkleErc1155Distributor {
    // Returns the address of the token distributed by this contract.
    function token() external view returns (address);
    // Returns true if the address has claimed already.
    function isClaimed(address account) external view returns (bool);
    // Claim the given amount of the token to the given address. Reverts if the inputs are invalid.
    function claim(uint256 index, address account, uint256 tokenId,  uint256 amount, bytes32[] calldata merkleProof) external;

    // This event is triggered whenever a call to #claim succeeds.
    event Claimed(address account, uint256 tokenId);
}