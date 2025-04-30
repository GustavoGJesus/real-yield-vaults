import { ethers } from "hardhat";
import { expect } from "chai";
import { MockUSDC, RealYieldVault, MockStrategy } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("RealYieldVault + MockStrategy Integration", function () {
  let usdc: MockUSDC;
  let vault: RealYieldVault;
  let strategy: MockStrategy;
  let owner: HardhatEthersSigner;
  let user: HardhatEthersSigner;

  const depositAmount = ethers.parseUnits("1000", 6); // 1000 USDC
  const yieldAmount = ethers.parseUnits("100", 6); // 100 USDC

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();

    // Deploy USDC token
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDCFactory.deploy();
    await usdc.waitForDeployment();

    // Deploy Vault
    const VaultFactory = await ethers.getContractFactory("RealYieldVault");
    vault = await VaultFactory.deploy(await usdc.getAddress());
    await vault.waitForDeployment();

    // Deploy Strategy
    const StrategyFactory = await ethers.getContractFactory("MockStrategy");
    strategy = await StrategyFactory.deploy(await usdc.getAddress());
    await strategy.waitForDeployment();

    // Set strategy in vault
    await vault.setStrategy(await strategy.getAddress());

    // Transfer tokens to user and approve vault
    await usdc.transfer(user.address, depositAmount);
    await usdc.connect(user).approve(await vault.getAddress(), depositAmount);
  });

  it("Should accept deposits and allow strategy to simulate yield", async () => {
    // User deposits into vault
    await vault.connect(user).deposit(depositAmount, user.address);
    
    // Transfer USDC from vault to strategy
    // In a real integration, the vault would handle this
    await usdc.connect(owner).transfer(await strategy.getAddress(), depositAmount);
    
    // Use deposit method to update the total tracked by the strategy
    await strategy.connect(owner).deposit(depositAmount);
    
    // Simulate yield
    await usdc.connect(owner).approve(await strategy.getAddress(), yieldAmount);
    await strategy.simulateYield(yieldAmount);

    // totalAssets = deposit + simulated yield
    const totalAssets = await strategy.totalAssets();
    expect(totalAssets).to.equal(depositAmount + yieldAmount);
  });

  it("Should harvest simulated yield back to the vault", async () => {
    // Deposit to vault
    await vault.connect(user).deposit(depositAmount, user.address);
    
    // Transfer USDC from vault to strategy (simulating vault investing in strategy)
    await usdc.connect(owner).transfer(await strategy.getAddress(), depositAmount);
    
    // Use deposit method to update the total tracked by the strategy
    await strategy.connect(owner).deposit(depositAmount);
    
    // Simulate yield
    await usdc.connect(owner).approve(await strategy.getAddress(), yieldAmount);
    await strategy.simulateYield(yieldAmount);

    // Vault balance before
    const balanceBefore = await usdc.balanceOf(await vault.getAddress());
    
    // Since we're using a mock strategy and mock vault integration,
    // we need to transfer the tokens to the strategy for it to harvest
    // Skip the transferFrom step in the vault.harvest function
    const tx = await vault.connect(owner).harvest();
    await tx.wait();

    // Vault balance after
    const balanceAfter = await usdc.balanceOf(await vault.getAddress());
    
    // Ensure only the yield was harvested
    expect(balanceAfter - balanceBefore).to.equal(yieldAmount);
  });
});