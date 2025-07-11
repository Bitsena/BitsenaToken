// scripts/prepare.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const solc = require('solc');

async function main() {
    console.log("Preparing contracts for verification...");

    // Create verify directory if it doesn't exist
    const verifyDir = path.join(__dirname, '../verify');
    if (!fs.existsSync(verifyDir)) {
        fs.mkdirSync(verifyDir);
    }

    // Flattening contracts
    console.log("Flattening contracts...");

    try {
        // Flatten Bitsena.sol
        execSync('npx hardhat flatten contracts/Bitsena.sol > verify/Bitsena_flat.sol', { stdio: 'inherit' });

        // Flatten BitsenaVesting.sol
        execSync('npx hardhat flatten contracts/BitsenaVesting.sol > verify/BitsenaVesting_flat.sol', { stdio: 'inherit' });

        console.log("Contracts flattened successfully!");

        // Clean up license identifiers (remove duplicates)
        cleanupLicenseIdentifiers('verify/Bitsena_flat.sol');
        cleanupLicenseIdentifiers('verify/BitsenaVesting_flat.sol');

        console.log("License identifiers cleaned up!");
        console.log("Contracts are ready for verification!");
        console.log("Flattened contracts saved in the 'verify' directory.");
    } catch (error) {
        console.error("Error flattening contracts:", error);
    }
}

function cleanupLicenseIdentifiers(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Find all SPDX license identifiers
    const licensePattern = /\/\/ SPDX-License-Identifier: .*/g;
    const matches = content.match(licensePattern) || [];

    if (matches.length > 0) {
        // Keep only the first license identifier
        const firstLicense = matches[0];

        // Remove all license identifiers
        content = content.replace(licensePattern, '');

        // Add back the first license at the top of the file
        content = firstLicense + '\n' + content;
    }

    // Remove duplicate pragma statements
    const pragmaPattern = /pragma solidity \^0\.\d+\.\d+;/g;
    const pragmaMatches = content.match(pragmaPattern) || [];

    if (pragmaMatches.length > 0) {
        // Keep only the first pragma
        const firstPragma = pragmaMatches[0];

        // Remove all pragma statements
        content = content.replace(pragmaPattern, '');

        // Add back the first pragma after the license
        if (matches.length > 0) {
            content = content.replace(matches[0] + '\n', matches[0] + '\n' + firstPragma + '\n');
        } else {
            content = firstPragma + '\n' + content;
        }
    }

    // Remove multiple empty lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    fs.writeFileSync(filePath, content, 'utf8');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });