// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.6.11;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155Holder.sol";
import "@openzeppelin/contracts/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IUpdateableMerkleErc1155Distributor.sol";

contract UpdateableMerkleErc1155Distributor is IUpdateableMerkleErc1155Distributor, Ownable, ERC1155Holder {
   

    address public immutable override token;
    bytes32 public merkleRoot;
    mapping(address => bool) claimedNft;

    // This event is triggered whenever a call to #claim succeeds.
    event MerkleRootUpdated(bytes32 indexed merkleRoot);

    constructor(address token_, bytes32 merkleRoot_) public {
        token = token_;
        merkleRoot = merkleRoot_;
    }

    function isClaimed(address account) public view override returns (bool) {
        return claimedNft[account];
    }

    function claim(
        uint256 index,
        address account,
        uint256 tokenId,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external override {
        require(!isClaimed(account), "MerkleDistributor: Drop already claimed.");
        require(account == msg.sender, "MerkleDistributor: sender is not claimant.");

        // Verify the merkle proof.
        bytes32 node = keccak256(abi.encodePacked(index, account, tokenId, amount));
        require(MerkleProof.verify(merkleProof, merkleRoot, node), "MerkleDistributor: Invalid proof.");
        require(IERC1155(token).balanceOf(msg.sender, tokenId) == 0, "MerkleDistributor: Already claimed.");

        // Mark it claimed and send the token.
        claimedNft[account] = true;
        IERC1155(token).safeTransferFrom(address(this), account, tokenId, amount, "");        

        emit Claimed(account, tokenId);
    }

    function setMerkleRoot(bytes32 newMerkleRoot) public onlyOwner {
        merkleRoot = newMerkleRoot;
        emit MerkleRootUpdated(newMerkleRoot);
    }

    function rescueTokens(address tokenAddress) public onlyOwner {
        uint256 balance = IERC20(tokenAddress).balanceOf(address(this));
        require(IERC20(tokenAddress).transfer(msg.sender, balance), "MerkleDistributor: Transfer failed.");
    }
  
    function rescueErc1155Tokens(uint256 tokenId, uint256 amount) public onlyOwner {
        IERC1155(token).safeTransferFrom(address(this), msg.sender, tokenId, amount, "");
    }

    function selfDestruct() public onlyOwner {
        selfdestruct(msg.sender);
    }
}
