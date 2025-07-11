// scripts/deploy.js
const { ethers } = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
    console.log("Starting deployment process...");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contracts with the account: ${deployer.address}`);

    // Deploy Bitsena Token
    console.log("Deploying Bitsena Token...");
    const Bitsena = await ethers.getContractFactory("Bitsena");
    const bitsena = await Bitsena.deploy();  // Removido o parâmetro deployer.address
    await bitsena.waitForDeployment();

    const bitsenaAddress = await bitsena.getAddress();
    console.log(`Bitsena Token deployed to: ${bitsenaAddress}`);

    // Deploy Vesting Contract
    console.log("Deploying Bitsena Vesting Contract...");
    const BitsenaVesting = await ethers.getContractFactory("BitsenaVesting");
    const vesting = await BitsenaVesting.deploy(bitsenaAddress);  // Removido o parâmetro deployer.address
    await vesting.waitForDeployment();

    const vestingAddress = await vesting.getAddress();
    console.log(`Bitsena Vesting deployed to: ${vestingAddress}`);

    // Calculate token distribution
    const totalSupply = ethers.parseEther("21000000000"); // 21 billion tokens

    const beneficiariesAmount = totalSupply * BigInt(15) / BigInt(100); // 15%
    const coreTeamAmount = totalSupply * BigInt(15) / BigInt(100);      // 15%
    const liquidezAmount = totalSupply * BigInt(30) / BigInt(100);      // 30%
    const investimentoAmount = totalSupply * BigInt(25) / BigInt(100);  // 25%
    const fundosAmount = totalSupply * BigInt(15) / BigInt(100);        // 15%

    console.log("Distributing tokens according to tokenomics...");

    // Verificar se todos os endereços de carteira estão definidos
    if (!process.env.BENEFICIARIOS_WALLET ||
        !process.env.CORE_TEAM_WALLET ||
        !process.env.LIQUIDEZ_WALLET ||
        !process.env.INVESTIMENTO_WALLET ||
        !process.env.FUNDOS_WALLET) {
        console.error("Erro: Todos os endereços de carteira devem estar definidos no arquivo .env");
        process.exit(1);
    }

    // Set timelock exemptions for distribution wallets
    await bitsena.batchSetTimelockExemption(
        [
            process.env.BENEFICIARIOS_WALLET,
            process.env.CORE_TEAM_WALLET,
            process.env.LIQUIDEZ_WALLET,
            process.env.INVESTIMENTO_WALLET,
            process.env.FUNDOS_WALLET,
            vestingAddress
        ],
        true
    );

    // Transfer tokens to distribution wallets
    console.log("Transferindo tokens para carteiras de distribuição...");

    try {
        console.log(`Transferindo ${ethers.formatEther(beneficiariesAmount)} BTS para carteira de Beneficiários...`);
        await bitsena.transfer(process.env.BENEFICIARIOS_WALLET, beneficiariesAmount);

        console.log(`Transferindo ${ethers.formatEther(liquidezAmount)} BTS para carteira de Liquidez...`);
        await bitsena.transfer(process.env.LIQUIDEZ_WALLET, liquidezAmount);

        console.log(`Transferindo ${ethers.formatEther(investimentoAmount)} BTS para carteira de Investimento...`);
        await bitsena.transfer(process.env.INVESTIMENTO_WALLET, investimentoAmount);

        console.log(`Transferindo ${ethers.formatEther(fundosAmount)} BTS para carteira de Fundos...`);
        await bitsena.transfer(process.env.FUNDOS_WALLET, fundosAmount);

        console.log(`Transferindo ${ethers.formatEther(coreTeamAmount)} BTS para contrato de Vesting...`);
        await bitsena.transfer(vestingAddress, coreTeamAmount);

        console.log("Distribuição de tokens concluída com sucesso");
    } catch (error) {
        console.error("Erro durante a transferência de tokens:", error);
        process.exit(1);
    }

    // Complete initial distribution
    console.log("Marcando distribuição inicial como concluída...");
    await bitsena.completeInitialDistribution();
    console.log("Distribuição inicial marcada como concluída");

    // Update .env file with contract addresses
    updateEnvFile(bitsenaAddress, vestingAddress);

    console.log("Implantação concluída com sucesso!");
    console.log(`Endereço do Token Bitsena: ${bitsenaAddress}`);
    console.log(`Endereço do Contrato de Vesting: ${vestingAddress}`);
}

function updateEnvFile(tokenAddress, vestingAddress) {
    try {
        let envContent = fs.readFileSync('.env', 'utf8');

        envContent = envContent.replace(
            /BITSENA_TOKEN_ADDRESS=.*/,
            `BITSENA_TOKEN_ADDRESS=${tokenAddress}`
        );

        envContent = envContent.replace(
            /BITSENA_VESTING_ADDRESS=.*/,
            `BITSENA_VESTING_ADDRESS=${vestingAddress}`
        );

        fs.writeFileSync('.env', envContent);
        console.log("Arquivo .env atualizado com os endereços dos contratos");
    } catch (error) {
        console.error("Erro ao atualizar o arquivo .env:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });