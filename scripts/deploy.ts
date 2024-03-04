import { ethers } from "hardhat";

async function main() {
  const nftDelegationRegistry = await ethers.deployContract("NFTDelegationRegistry");

  await nftDelegationRegistry.waitForDeployment();

  console.log(
    `NFTDelegationRegistry with deployed to ${nftDelegationRegistry.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
