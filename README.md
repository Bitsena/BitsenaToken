# Bitsena Token (BTS)

<p align="center">
  <img src="https://bitsena.com.br/assets/logo_github.png" alt="Bitsena Logo" width="200"/>
</p>

## Overview

The BTS (Bitsena) is a utility token developed by FusionLabs Brasil as an integral component of the Bitsena ecosystem, a revolutionary platform that democratizes participation in the Bitcoin network through accessible and environmentally sustainable solo mining devices.

Bitsena functions as a "Bitcoin digital lottery" where each device generates hashes that compete in the network to find blocks, offering 144 daily chances to win a complete Bitcoin block reward. Although the probability is small (similar to traditional lotteries), the chance is real and fully transparent.

BTS creates a virtuous value cycle through an automated liquidity mechanism. 30% of the value from both token sales and equipment sales is directed to token liquidity pools, creating constant buying pressure and potentially benefiting all participants in the ecosystem as adoption grows.

With a fixed total supply of 21,000,000,000 tokens, BTS offers users potential returns through token appreciation, complementing Bitsena's unique value proposition as a superior alternative to traditional lotteries - with 144 daily chances to win, zero taxes, total anonymity, and minimal energy consumption.

## Token Details

- **Name**: Bitsena
- **Symbol**: BTS
- **Decimals**: 18
- **Total Supply**: 21,000,000,000 BTS
- **Contract Standard**: BEP-20 (Binance Smart Chain)
- **Blockchain**: Binance Smart Chain (BSC)
- **Contract Address**: 0x24BC580f39b328BA5896498415f74BBC1009AAe6
- **Vesting Contract**: 0x467960970a576c566F695aB6a385cc08aD546a28

## Token Distribution

The total supply of 21 billion BTS tokens is distributed as follows:

- **Beneficiaries (15%)**: 3,150,000,000 BTS - 0x15C8C04be5df85b08D8f532Cc62dad13bAa691D8
- **Core Team (15%)**: 3,150,000,000 BTS - 0x0355fF83a68d4A17b43945756F7b81DFE389448d (subject to 24-month vesting)
- **Liquidity (30%)**: 6,300,000,000 BTS - 0x3D5093B0f91Dc8C5EAF2EbA35f3Fe90503768403
- **Investment (25%)**: 5,250,000,000 BTS - 0xC9467490C6b0c2855Ad059aB69A45fDf97B74804
- **Funds (15%)**: 3,150,000,000 BTS - 0x30aBb108594942891501484FA8b89fa0689E5733

## Special Features

### 90-Day Purchase Timelock

To promote long-term holding and project stability, BTS implements a 90-day timelock for token purchases during the first year after deployment:

- The timelock is only active during the first 365 days after contract deployment
- Any tokens purchased during this period are locked for 90 days from the purchase date
- After the initial 90 days, tokens become transferable
- After the first year, the timelock mechanism is automatically deactivated
- Certain addresses (operational wallets) are exempt from the timelock

### Team Vesting

The Core Team allocation (15% of total supply) is subject to a 24-month vesting schedule:

- 6-month initial lock period
- Quarterly releases over 18 months (after the initial lock)
- Managed through a dedicated vesting contract

## Dual Liquidity Mechanism

BTS features an innovative dual liquidity mechanism that operates on two fronts:

1. **Equipment Sales**: 30% of the value from each Bitsena device sold is automatically directed to BTS liquidity pools
2. **Token Sales**: 30% of the value from direct token purchases is also allocated to strengthen liquidity

This creates a robust foundation for the token ecosystem, with value flowing in from both hardware sales and direct token transactions.

## Smart Contracts

This repository contains the following smart contracts:

1. **BTSToken.sol**: The main BTS token contract with timelock functionality
2. **BTSVesting.sol**: The vesting contract for the Core Team allocation

## Development and Deployment

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Hardhat

### Installation

```bash
# Clone the repository
git clone https://github.com/Bitsena/BitsenaToken.git
cd BitsenaToken

# Install dependencies
npm install
```

### Configuration

Create a .env file based on .env.example and fill in your private key and wallet addresses.

### Deployment

```bash
# Compile contracts
npm run compile

# Deploy to BSC Testnet
npm run deploy:testnet

# Deploy to BSC Mainnet
npm run deploy:mainnet
```

### Verification

```bash
# Verify token contract on BSC Testnet
npm run verify:testnet

# Verify vesting contract on BSC Testnet
npm run verify:vesting:testnet

# Verify token contract on BSC Mainnet
npm run verify:mainnet

# Verify vesting contract on BSC Mainnet
npm run verify:vesting:mainnet

# Prepare for manual verification
npm run prepare-verify
```

### Token Management

```bash
# Manage team members and allocations
npm run manager

# Change contract ownership
npm run changeOwner -- <NEW_OWNER_ADDRESS> <CONTRACT_TYPE> --network <NETWORK>

# Check environment variables
npm run check-env
```

### Social Impact

The Bitsena ecosystem allocates 20% of all revenue to support children and adolescents with specific needs, including:

- Autism Spectrum Disorder

- Childhood cancer

- Down Syndrome

- Cerebral palsy

- Rare diseases

- Victims of abuse, kidnapping, and human trafficking

- Children in situations of social vulnerability

All donations are transparently recorded on the blockchain and publicly verifiable.

### License

This project is licensed under the MIT License with attribution requirements. You are free to use, modify, and distribute the code, but you must include the original copyright notice and attribution to FusionLabs Brasil Ltda.

### Contact

- Website: www.bitsena.com.br
- Developer: www.fusionlabs.com.br
- Email: token@bitsena.com.br
- Telegram: t.me/BitsenaCommunity
- GitHub: https://github.com/Bitsena

### Disclaimer

This token and its associated contracts are provided as-is without any warranties. Users should conduct their own research and due diligence before interacting with the contracts.