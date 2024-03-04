// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

/**
 * @title NFT Delegation Registry
 * @dev This contract allows for the delegation of ERC721 NFTs without transferring ownership.
 */
contract NFTDelegationRegistry {
  struct Delegation {
    address delegatee;
    uint256 expiryTime;
  }

  // Mapping from NFT (token address + token ID) to delegation details
  mapping(address => mapping(uint256 => Delegation)) public delegations;

  /**
   * @dev Error to indicate the caller is not the owner of the NFT.
   * @param delegator The address attempting the delegation.
   * @param nftAddress The address of the NFT contract.
   * @param tokenId The token ID of the NFT.
   */
  error DelegatorIsNotTheOwner(address delegator, address nftAddress, uint256 tokenId);

  // Event declarations
  event NFTDelegated(
    address indexed nftAddress,
    uint256 indexed tokenId,
    address indexed delegatee,
    uint256 expiryTime
  );
  event DelegationRevoked(
    address indexed nftAddress,
    uint256 indexed tokenId
  );

  /**
   * @dev Delegates an NFT to another account.
   * @param nftAddress The address of the NFT contract.
   * @param tokenId The token ID of the NFT to delegate.
   * @param delegatee The address to delegate the NFT to.
   * @param duration The duration of the delegation in seconds.
   */
  function delegateNFT(
    address nftAddress,
    uint256 tokenId,
    address delegatee,
    uint256 duration
  ) public {
    if (IERC721(nftAddress).ownerOf(tokenId) != msg.sender) {
      revert DelegatorIsNotTheOwner(msg.sender, nftAddress, tokenId);
    }

    Delegation memory newDelegation = Delegation(delegatee, block.timestamp + duration);

    delegations[nftAddress][tokenId] = newDelegation;

    emit NFTDelegated(
      nftAddress,
      tokenId,
      delegatee,
      newDelegation.expiryTime
    );
  }

  /**
   * @dev Checks if an address is currently a delegatee for an NFT.
   * @param nftAddress The address of the NFT contract.
   * @param tokenId The token ID of the NFT.
   * @param delegatee The address to check for delegation.
   * @return bool True if the address is the current delegatee for the NFT.
   */
  function isDelegateeOf(
    address nftAddress,
    uint256 tokenId,
    address delegatee
  ) public view returns (bool) {
    Delegation memory delegation = delegations[nftAddress][tokenId];
    return
        delegation.delegatee == delegatee &&
        delegation.expiryTime > block.timestamp;
  }

  /**
   * @dev Revokes the delegation of an NFT.
   * @param nftAddress The address of the NFT contract.
   * @param tokenId The token ID of the NFT whose delegation is to be revoked.
   */
  function revokeDelegation(address nftAddress, uint256 tokenId) public {
    if (IERC721(nftAddress).ownerOf(tokenId) != msg.sender) {
      revert DelegatorIsNotTheOwner(msg.sender, nftAddress, tokenId);
    }

    delete delegations[nftAddress][tokenId];

    emit DelegationRevoked(nftAddress, tokenId);
  }
}
