import { expect } from "chai";
import { ethers } from "hardhat";
import { MockUSDC } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("MockUSDC", function () {
  let mockUSDC: MockUSDC;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const initialSupply = ethers.parseUnits("1000000", 6); // 1M USDC with 6 decimals
  const maxMintAmount = ethers.parseUnits("10000000", 6); // 10M USDC

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy contract
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDCFactory.deploy();
    await mockUSDC.waitForDeployment();
  });

  describe("Initialization", function () {
    it("Should set the right name and symbol", async function () {
      expect(await mockUSDC.name()).to.equal("Mock USD Coin");
      expect(await mockUSDC.symbol()).to.equal("mUSDC");
    });

    it("Should set decimals to 6", async function () {
      expect(await mockUSDC.decimals()).to.equal(6);
    });

    it("Should mint initial supply to deployer", async function () {
      expect(await mockUSDC.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("Should set the right owner", async function () {
      expect(await mockUSDC.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseUnits("1000", 6);
      await mockUSDC.mint(user1.address, mintAmount);
      expect(await mockUSDC.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should revert when non-owner tries to mint", async function () {
      const mintAmount = ethers.parseUnits("1000", 6);
      await expect(
        mockUSDC.connect(user1).mint(user1.address, mintAmount)
      ).to.be.revertedWithCustomError(mockUSDC, "OwnableUnauthorizedAccount");
    });

    it("Should revert when minting more than maximum amount", async function () {
      const tooMuch = ethers.parseUnits("11000000", 6); // 11M USDC
      await expect(
        mockUSDC.mint(user1.address, tooMuch)
      ).to.be.revertedWithCustomError(mockUSDC, "ExceedsMaxMintAmount");
    });

    it("Should allow minting up to maximum amount", async function () {
      await mockUSDC.mint(user2.address, maxMintAmount);
      expect(await mockUSDC.balanceOf(user2.address)).to.equal(maxMintAmount);
    });
  });

  describe("Token transfers", function () {
    beforeEach(async function () {
      // Transfer some tokens to user1 for testing
      await mockUSDC.transfer(user1.address, ethers.parseUnits("10000", 6));
    });

    it("Should transfer tokens correctly", async function () {
      const transferAmount = ethers.parseUnits("5000", 6);
      await mockUSDC.connect(user1).transfer(user2.address, transferAmount);
      
      expect(await mockUSDC.balanceOf(user2.address)).to.equal(transferAmount);
      expect(await mockUSDC.balanceOf(user1.address)).to.equal(ethers.parseUnits("5000", 6));
    });
  });
}); 