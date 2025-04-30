import { ethers } from "hardhat";
import { verify } from "./verify";

async function main() {
  console.log("Deploying contracts...");

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} ETH`);

  const networkName = (await ethers.provider.getNetwork()).name;

  const txOptions = {};
  if (networkName === "hardhat" || networkName === "localhost") {
    const feeData = await ethers.provider.getFeeData();
    const baseFee = feeData.gasPrice || ethers.parseUnits("20", "gwei");
    Object.assign(txOptions, {
      gasPrice: baseFee * 2n,
    });
  }

  // Deploy MockUSDC
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy(txOptions);
  await mockUSDC.waitForDeployment();
  const mockUSDCAddress = await mockUSDC.getAddress();
  console.log(`MockUSDC deployed to: ${mockUSDCAddress}`);

  // Deploy RealYieldVault
  const RealYieldVault = await ethers.getContractFactory("RealYieldVault");
  const vault = await RealYieldVault.deploy(mockUSDCAddress, txOptions);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log(`RealYieldVault deployed to: ${vaultAddress}`);

  // Verify contracts on Etherscan
  if (networkName !== "hardhat" && networkName !== "localhost") {
    console.log("Waiting for block confirmations...");
    await mockUSDC.deploymentTransaction()?.wait(5);
    await vault.deploymentTransaction()?.wait(5);

    await verify(mockUSDCAddress, []);
    await verify(vaultAddress, [mockUSDCAddress]);
  }

  console.log("Deployment completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });