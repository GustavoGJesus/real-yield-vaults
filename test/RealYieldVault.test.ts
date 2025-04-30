import { expect } from "chai";
import { ethers } from "hardhat";
import { RealYieldVault, MockUSDC } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("RealYieldVault", function () {
  let vault: RealYieldVault;
  let usdc: MockUSDC;
  let owner: HardhatEthersSigner;
  let user: HardhatEthersSigner;

  const initialSupply = ethers.parseUnits("1000000", 6); // 1M USDC
  const depositAmount = ethers.parseUnits("1000", 6); // 1k USDC

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDCFactory.deploy();
    await usdc.waitForDeployment();

    const RealYieldVaultFactory = await ethers.getContractFactory("RealYieldVault");
    vault = await RealYieldVaultFactory.deploy(await usdc.getAddress());
    await vault.waitForDeployment();

    // Transfer tokens to user and approve
    await usdc.transfer(user.address, depositAmount);
    await usdc.connect(user).approve(await vault.getAddress(), depositAmount);
  });

  describe("Deployment", function () {
    it("Should set the correct asset token", async function () {
      expect(await vault.asset()).to.equal(await usdc.getAddress());
    });
  });

  describe("Deposit", function () {
    it("Should allow deposits and mint shares", async function () {
      await vault.connect(user).deposit(depositAmount, user.address);

      expect(await vault.balanceOf(user.address)).to.equal(depositAmount);
      expect(await usdc.balanceOf(user.address)).to.equal(0);
    });

    it("Should revert if deposit is zero", async function () {
      await expect(
        vault.connect(user).deposit(0, user.address)
      ).to.be.revertedWithCustomError(vault, "ZeroAmount");
    });
  });

  describe("Withdraw", function () {
    beforeEach(async function () {
      await vault.connect(user).deposit(depositAmount, user.address);
    });

    it("Should allow withdrawal and burn shares", async function () {
      await vault.connect(user).withdraw(depositAmount, user.address, user.address);

      expect(await vault.balanceOf(user.address)).to.equal(0);
      expect(await usdc.balanceOf(user.address)).to.equal(depositAmount);
    });

    it("Should revert if withdraw is zero", async function () {
      await expect(
        vault.connect(user).withdraw(0, user.address, user.address)
      ).to.be.revertedWithCustomError(vault, "ZeroAmount");
    });
  });

  describe("Pause", function () {
    it("Should allow owner to pause and unpause", async function () {
      await vault.pause();
      expect(await vault.paused()).to.equal(true);

      await vault.unpause();
      expect(await vault.paused()).to.equal(false);
    });

    it("Should revert deposits when paused", async function () {
      await vault.pause();
      await expect(
        vault.connect(user).deposit(depositAmount, user.address)
      ).to.be.revertedWithCustomError(vault, "EnforcedPause");
    });
  });
});