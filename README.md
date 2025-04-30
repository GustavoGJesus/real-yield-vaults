# Real Yield Vaults

A production-grade DeFi project for yield-generating vaults targeting investors and major companies.

## Overview

This project implements secure, auditable, and optimized yield-generating vaults that offer real yield from protocol fees and other sustainable sources rather than temporary incentives.

## Tech Stack

- Solidity 0.8.24
- Hardhat development environment
- OpenZeppelin contracts for security best practices
- TypeScript for testing and deployment scripts
- Gas optimization techniques for production deployment

## Getting Started

### Prerequisites

- Node.js (>= 18.x)
- npm or yarn
- An Ethereum wallet with test ETH for deployment

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/real-yield-vaults.git
cd real-yield-vaults
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Fill in your environment variables in `.env`

### Compilation

```bash
npm run compile
```

### Testing

Run the comprehensive test suite:
```bash
npm test
```

For gas reporting:
```bash
npm run test:gas
```

For coverage analysis:
```bash
npm run test:coverage
```

### Deployment

#### Local Deployment

Start a local Hardhat node:
```bash
npm run node
```

In a separate terminal, deploy to the local network:
```bash
npm run deploy:local
```

#### Testnet Deployment

Deploy to Sepolia testnet:
```bash
npm run deploy:sepolia
```

#### Mainnet Deployment

Deploy to Ethereum mainnet:
```bash
npm run deploy:mainnet
```

Deploy to Arbitrum:
```bash
npm run deploy:arbitrum
```

## Contract Verification

After deployment, verify your contracts on Etherscan:
```bash
npm run verify <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Security

This project follows strict security best practices:

1. Using OpenZeppelin contracts for standard implementations
2. Complete test coverage for all functions
3. Gas optimization without compromising security
4. Security-focused design patterns
5. Protection against common vulnerabilities:
   - Reentrancy
   - Integer overflow/underflow (using Solidity 0.8.x built-in checks)
   - Front-running
   - Access control vulnerabilities

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security Contact

For security-related issues, please contact security@example.com
