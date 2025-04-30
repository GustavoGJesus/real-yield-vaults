// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IStrategy.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockStrategy
 * @dev Fake strategy that simulates yield generation for testing purposes.
 */
contract MockStrategy is IStrategy, Ownable(msg.sender) {
    IERC20 public immutable token;
    uint256 public total;        // Total assets managed by strategy
    uint256 public simulatedYield; // Yield accumulated for next harvest

    constructor(address _token) {
        token = IERC20(_token);
    }

    /// @notice Deposit tokens into the strategy
    function deposit(uint256 amount) external override {
        require(amount > 0, "ZERO_AMOUNT");
        
        // For testing: if owner calls, just update the total (assume tokens already transferred)
        if (msg.sender == owner()) {
            total += amount;
        } else {
            token.transferFrom(msg.sender, address(this), amount);
            total += amount;
        }
    }

    /// @notice Withdraw tokens from the strategy
    function withdraw(uint256 amount) external override onlyOwner {
        require(amount <= total, "INSUFFICIENT_FUNDS");

        total -= amount;
        token.transfer(msg.sender, amount);
    }

    /// @notice Simulate earnings for harvest
    function simulateYield(uint256 amount) external onlyOwner {
        simulatedYield += amount;
        token.transferFrom(msg.sender, address(this), amount);
    }

    /// @notice Harvest the accumulated yield
    function harvest() external override returns (uint256) {
        uint256 yield = simulatedYield;
        simulatedYield = 0;

        token.transfer(msg.sender, yield);
        return yield;
    }

    /// @notice View the total managed assets
    function totalAssets() external view override returns (uint256) {
        return total + simulatedYield;
    }

    function asset() external view override returns (address) {
        return address(token);
    }
}