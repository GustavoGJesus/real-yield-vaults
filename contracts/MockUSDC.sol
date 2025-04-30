// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MockUSDC
 * @dev A mock USDC implementation for testing purposes
 * @custom:security-contact security@example.com
 */
contract MockUSDC is ERC20, Ownable, ReentrancyGuard {
    error ExceedsMaxMintAmount(uint256 requested, uint256 max);
    
    uint256 public constant MAX_MINT_AMOUNT = 10_000_000 * 10**6; // 10M USDC
    
    /**
     * @dev Constructor initializes the token with name, symbol, and initial supply
     */
    constructor() ERC20("Mock USD Coin", "mUSDC") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10**decimals());
    }

    /**
     * @dev Override decimals to match USDC's 6 decimals
     * @return The number of decimals used for user representation
     */
    function decimals() public pure override returns (uint8) {
        return 6;
    }
    
    /**
     * @dev Allows owner to mint additional tokens
     * @param to Address to receive the minted tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner nonReentrant {
        if (amount > MAX_MINT_AMOUNT) {
            revert ExceedsMaxMintAmount(amount, MAX_MINT_AMOUNT);
        }
        _mint(to, amount);
    }
}