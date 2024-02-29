pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "hardhat/console.sol";

contract OpenfortNFT is ERC721{
    uint256 private _nextTokenId;

    constructor() ERC721("OpenfortNFT", "OFNFT") {}

    function mint() public returns (uint256) {
      uint256 tokenId = _nextTokenId++;
      _safeMint(msg.sender, tokenId);

      return tokenId;
    }
}