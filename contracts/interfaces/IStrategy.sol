// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IStrategy
 * @dev Interface for plug-and-play yield strategies for vaults
 */
interface IStrategy {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function totalAssets() external view returns (uint256);
    function harvest() external returns (uint256);
    function asset() external view returns (address);
}