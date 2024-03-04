import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

const ONE_HOUR_IN_SECS = BigInt(60 * 60);
const ONE_MINUTE = BigInt(60);
const firstNftId = BigInt(0);

describe("NFTDelegationRegistry", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function setupNFTDelegationRegistry() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, thirdAccount] = await ethers.getSigners();

    const currentTime = BigInt((await time.latest()));

    const OpenfortNFT = await ethers.getContractFactory("OpenfortNFT");
    const nft = await OpenfortNFT.deploy();
    const NFTDelegationRegistry = await ethers.getContractFactory("NFTDelegationRegistry");
    const nftDelegationRegistry = await NFTDelegationRegistry.deploy();
    await Promise.all([
      nft.waitForDeployment(),
      nftDelegationRegistry.waitForDeployment(),
    ]);

    return {
      nft,
      nftDelegationRegistry,
      ownerAddress: owner.address,
      otherAccount,
      otherAccountAddress: otherAccount.address,
      thirdAccountAddress: thirdAccount.address,
      currentTime,
    };
  }

  describe("Manage delegation", function () {
    it("Shouldn't delegate a given NFT if the delegator is not the owner", async function () {
      // Given
      const { nft, otherAccount, otherAccountAddress, nftDelegationRegistry } = await loadFixture(
        setupNFTDelegationRegistry
      );
      await nft.mint();
      await expect(
        // When
        nftDelegationRegistry.connect(otherAccount).delegateNFT(nft.target, firstNftId, otherAccountAddress, ONE_HOUR_IN_SECS)
        // Then
      ).to.be.rejectedWith("DelegatorIsNotTheOwner");
    
    });

    it("Should delegate a given NFT by its owner to another account", async function () {
      // Given
      const { nft, otherAccountAddress, nftDelegationRegistry } = await loadFixture(
        setupNFTDelegationRegistry
      );
      await nft.mint();
      // When
      await nftDelegationRegistry.delegateNFT(nft.target, firstNftId, otherAccountAddress, ONE_HOUR_IN_SECS);
      // Then
      const isDelegatee = await nftDelegationRegistry.isDelegateeOf(nft.target, firstNftId, otherAccountAddress);
      expect(isDelegatee).to.equal(true);
    });
    
    it("Should expire the delegation after the given time", async function () {
      // Given
      const { nft, otherAccountAddress, nftDelegationRegistry, currentTime } = await loadFixture(
        setupNFTDelegationRegistry
      );
      await nft.mint();
      // When
      await nftDelegationRegistry.delegateNFT(nft.target, firstNftId, otherAccountAddress, ONE_HOUR_IN_SECS);
      await time.increaseTo(currentTime + BigInt(ONE_HOUR_IN_SECS + ONE_MINUTE));
      // Then
      const isDelegatee = await nftDelegationRegistry.isDelegateeOf(nft.target, firstNftId, otherAccountAddress);
      expect(isDelegatee).to.equal(false);
    });

    it("Should delegate only to the given account", async function () {
      // Given
      const { nft, otherAccountAddress, nftDelegationRegistry, thirdAccountAddress } = await loadFixture(
        setupNFTDelegationRegistry
      );
      await nft.mint();
      // When
      await nftDelegationRegistry.delegateNFT(nft.target, firstNftId, thirdAccountAddress, ONE_HOUR_IN_SECS);
      // Then
      const isDelegatee = await nftDelegationRegistry.isDelegateeOf(nft.target, firstNftId, otherAccountAddress);
      expect(isDelegatee).to.equal(false);
    });

    it("Shouldn't revoke the delegation when not called from the NFT owner", async function () {
      // Given
      const { nft, otherAccount, otherAccountAddress, nftDelegationRegistry } = await loadFixture(
        setupNFTDelegationRegistry
      );
      await nft.mint();
      await nftDelegationRegistry.delegateNFT(nft.target, firstNftId, otherAccountAddress, ONE_HOUR_IN_SECS);
      await expect(
        // When
        nftDelegationRegistry.connect(otherAccount).revokeDelegation(nft.target, firstNftId)
        // Then
      ).to.be.rejectedWith("DelegatorIsNotTheOwner");
    });
    
    it("Should revoke the delegation properly", async function () {
      // Given
      const { nft, otherAccountAddress, nftDelegationRegistry } = await loadFixture(
        setupNFTDelegationRegistry
      );
      await nft.mint();
      await nftDelegationRegistry.delegateNFT(nft.target, firstNftId, otherAccountAddress, ONE_HOUR_IN_SECS);
      // When
      await nftDelegationRegistry.revokeDelegation(nft.target, firstNftId);
      // Then
      const isDelegatee = await nftDelegationRegistry.isDelegateeOf(nft.target, firstNftId, otherAccountAddress);
      expect(isDelegatee).to.equal(false);
    });

    it("Should not transfer the NFT when delegating", async function () {
      // Given
      const { nft, ownerAddress, otherAccountAddress, nftDelegationRegistry } = await loadFixture(setupNFTDelegationRegistry);
      // When
      await nft.mint();
      await nftDelegationRegistry.delegateNFT(nft.target, firstNftId, otherAccountAddress, ONE_HOUR_IN_SECS);
      // Then
      const isDelegatee = await nftDelegationRegistry.isDelegateeOf(nft.target, firstNftId, otherAccountAddress);
      expect(isDelegatee).to.equal(true);
      const tokenOwnerAddress = await nft.ownerOf(firstNftId);
      expect(tokenOwnerAddress).to.equal(ownerAddress);
    });
  });
  describe("NFTDelegationRegistry Events", function () {
    it("Should emit NFTDelegated event", async function () {
      // Given
      const { nft, otherAccountAddress, nftDelegationRegistry, currentTime } = await loadFixture(
        setupNFTDelegationRegistry
      );
      await nft.mint();
      const tx = await nftDelegationRegistry.delegateNFT(nft.target, firstNftId, otherAccountAddress, ONE_HOUR_IN_SECS);
      await expect(
        // When
        tx
        // Then
      ).to.emit(nftDelegationRegistry, "NFTDelegated");
      
      const receipt = await tx.wait();
      // Low level inspection to allow to expect expiry time with closeTo
      // @ts-expect-error
      const event = receipt?.logs.find(log => log.fragment.name === "NFTDelegated");
      // @ts-expect-error
      expect(event?.args[0]).to.equal(nft.target);
      // @ts-expect-error
      expect(event?.args[1]).to.equal(firstNftId);
      // @ts-expect-error
      expect(event?.args[2]).to.equal(otherAccountAddress);
      // @ts-expect-error
      const eventExpiryTime = BigInt(event?.args[3]);
      expect(eventExpiryTime).to.be.closeTo(currentTime + ONE_HOUR_IN_SECS, 10);
    });

    it("Should emit DelegationRevoked event", async function () {
      // Given
      const { nft, otherAccountAddress, nftDelegationRegistry } = await loadFixture(
        setupNFTDelegationRegistry
      );
      await nft.mint();
      await nftDelegationRegistry.delegateNFT(nft.target, firstNftId, otherAccountAddress, ONE_HOUR_IN_SECS);
      await expect(
        // When
        nftDelegationRegistry.revokeDelegation(nft.target, firstNftId)
        // Then
      ).to.emit(nftDelegationRegistry, "DelegationRevoked").withArgs(nft.target, firstNftId);
    });
  });
  
});
