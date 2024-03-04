import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

const firstNftId = BigInt(0);

describe("NFT", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function setupNFT() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, thirdAccount] = await ethers.getSigners();
    const OpenfortNFT = await ethers.getContractFactory("OpenfortNFT");
    const nft = await OpenfortNFT.deploy();

    return {
      nft,
      ownerAddress: owner.address,
      otherAccountAddress: otherAccount.address,
      thirdAccountAddress: thirdAccount.address,
    };
  }

  describe("NFT is mintable and transferable", function () {
    it("Should mint and transfer the NFT to the sender", async function () {
      // Given
      const { nft, ownerAddress } = await loadFixture(setupNFT);
      // When
      await nft.mint();
      // Then
      const tokenOwnerAddress = await nft.ownerOf(firstNftId);
      expect(tokenOwnerAddress).to.equal(ownerAddress);
    });

    it("Should be able to transfer the NFT to another account", async function () {
      // Given
      const { nft, ownerAddress, otherAccountAddress } = await loadFixture(setupNFT);
      // When
      await nft.mint();
      await nft.transferFrom(ownerAddress, otherAccountAddress, firstNftId);
      // Then
      const tokenOwnerAddress = await nft.ownerOf(firstNftId);
      expect(tokenOwnerAddress).to.equal(otherAccountAddress);
    });
    
    it("Shouldn't be able to transfer the NFT to another account if not the owner", async function () {
      // Given
      const { nft, otherAccountAddress, thirdAccountAddress } = await loadFixture(setupNFT);
      // When
      await nft.mint();
      await expect(
        nft.transferFrom(thirdAccountAddress, otherAccountAddress, firstNftId)
        // Then
      ).to.be.rejectedWith("ERC721IncorrectOwner");
    });
  });

  describe("NFT Events", function () {
    it("Should emit the transfer event when minting", async function () {
      // Given
      const { nft, ownerAddress } = await loadFixture(setupNFT);
      await expect(
        // When
        nft.mint()
        // Then
      ).to.emit(nft, "Transfer").withArgs(ethers.ZeroAddress, ownerAddress, 0);
    });
  });
});
