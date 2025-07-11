// scripts/changeOwner.js
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`Using account: ${deployer.address}`);

    // Get command line arguments
    const args = process.argv.slice(2);
    const newOwner = args[0];
    const contractType = args[1]; // "token" or "vesting" or "both"

    if (!newOwner || !contractType) {
        console.log(`
Usage: npx hardhat run scripts/changeOwner.js <newOwnerAddress> <contractType> --network <network>

Contract Types:
  token   - Change owner of Bitsena Token
  vesting - Change owner of Bitsena Vesting
  both    - Change owner of both contracts
    `);
        return;
    }

    // Validate new owner address
    if (!ethers.isAddress(newOwner)) {
        console.error("Invalid address format for new owner");
        return;
    }

    // Load contracts
    const tokenAddress = process.env.BITSENA_TOKEN_ADDRESS;
    const vestingAddress = process.env.BITSENA_VESTING_ADDRESS;

    if (!tokenAddress || !vestingAddress) {
        console.error("Contract addresses not found in .env file");
        return;
    }

    // Change ownership based on contract type
    if (contractType === "token" || contractType === "both") {
        console.log(`Changing ownership of Bitsena Token to ${newOwner}...`);
        const Bitsena = await ethers.getContractFactory("Bitsena");
        const token = Bitsena.attach(tokenAddress);

        const tx = await token.transferOwnership(newOwner);
        await tx.wait();
        console.log(`Bitsena Token ownership transferred successfully! Transaction: ${tx.hash}`);
    }

    if (contractType === "vesting" || contractType === "both") {
        console.log(`Changing ownership of Bitsena Vesting to ${newOwner}...`);
        const BitsenaVesting = await ethers.getContractFactory("BitsenaVesting");
        const vesting = BitsenaVesting.attach(vestingAddress);

        const tx = await vesting.transferOwnership(newOwner);
        await tx.wait();
        console.log(`Bitsena Vesting ownership transferred successfully! Transaction: ${tx.hash}`);
    }

    console.log("Ownership transfer completed!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });