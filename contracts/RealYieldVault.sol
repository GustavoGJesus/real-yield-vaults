// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RealYieldVault
 * @dev ERC4626-compliant vault that accepts USDC and mints shares.
 * External strategies can be plugged in later to generate real yield.
 */
contract RealYieldVault is ERC4626, Ownable, ReentrancyGuard, Pausable {
    error ZeroAddress();
    error ZeroAmount();

    event EmergencyPause(address indexed triggeredBy);
    event EmergencyUnpause(address indexed triggeredBy);

    constructor(address asset_)
        ERC4626(IERC20(asset_))
        ERC20("Real Yield Vault Share", "RYV")
        Ownable(msg.sender)
    {
        if (asset_ == address(0)) revert ZeroAddress();
    }

    /**
     * @dev Override deposit to include additional security checks
     */
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

    /**
     * @dev Override withdraw to include additional security checks
     */
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

    /**
     * @dev Emergency pause functionality (only callable by the owner)
     */
    function pause() external onlyOwner {
        _pause();
        emit EmergencyPause(msg.sender);
    }

    /**
     * @dev Resume vault operations after an emergency pause (only callable by the owner)
     */
    function unpause() external onlyOwner {
        _unpause();
        emit EmergencyUnpause(msg.sender);
    }
}