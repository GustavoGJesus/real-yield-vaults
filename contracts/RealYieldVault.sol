// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IStrategy.sol";

/**
 * @title RealYieldVault
 * @dev ERC4626-compliant vault with strategy integration
 */
contract RealYieldVault is ERC4626, Ownable, ReentrancyGuard, Pausable {
    error ZeroAddress();
    error ZeroAmount();

    event EmergencyPause(address indexed triggeredBy);
    event EmergencyUnpause(address indexed triggeredBy);
    event StrategySet(address indexed newStrategy);
    event Harvested(uint256 amount);

    IStrategy public strategy;

    constructor(address asset_)
        ERC4626(IERC20(asset_))
        ERC20("Real Yield Vault Share", "RYV")
        Ownable(msg.sender)
    {
        if (asset_ == address(0)) revert ZeroAddress();
    }

    // -------------------------
    // Vault Logic (unchanged)
    // -------------------------

    function deposit(uint256 assets, address receiver)
        public
        override
        whenNotPaused
        nonReentrant
        returns (uint256)
    {
        if (assets == 0) revert ZeroAmount();
        return super.deposit(assets, receiver);
    }

    function withdraw(uint256 assets, address receiver, address owner_)
        public
        override
        whenNotPaused
        nonReentrant
        returns (uint256)
    {
        if (assets == 0) revert ZeroAmount();
        return super.withdraw(assets, receiver, owner_);
    }

    function pause() external onlyOwner {
        _pause();
        emit EmergencyPause(msg.sender);
    }

    function unpause() external onlyOwner {
        _unpause();
        emit EmergencyUnpause(msg.sender);
    }

    // -------------------------
    // Strategy Logic
    // -------------------------

    function setStrategy(address newStrategy) external onlyOwner {
        if (newStrategy == address(0)) revert ZeroAddress();
        strategy = IStrategy(newStrategy);
        emit StrategySet(newStrategy);
    }

    function harvest() external nonReentrant whenNotPaused returns (uint256) {
        require(address(strategy) != address(0), "Strategy not set");

        uint256 yield = strategy.harvest();
        // The strategy's harvest function already transfers the yield to this vault
        // No need for another transferFrom

        emit Harvested(yield);
        return yield;
    }
}