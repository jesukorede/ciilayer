import { ethers } from "hardhat";

async function main() {
  const Factory = await ethers.getContractFactory("OperantXRegistry");
  const registry = await Factory.deploy();
  await registry.waitForDeployment();

  const addr = await registry.getAddress();
  // eslint-disable-next-line no-console
  console.log("CiiLayerRegistry deployed to:", addr);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
