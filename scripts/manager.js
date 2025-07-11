// scripts/manager.js
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`Using account: ${deployer.address}`);

    // Get command line arguments
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
        console.log(`
Usage: npx hardhat run scripts/manager.js <command> [args] --network <network>

Commands:
  addMember <address> <allocation>     - Add a team member with allocation (in BTS)
  updateMember <address> <allocation>  - Update a team member's allocation (in BTS)
  removeMember <address>               - Remove a team member
  listMembers                          - List all team members
  getMemberInfo <address>              - Get information about a specific team member
    `);
        return;
    }

    // Load vesting contract
    const vestingAddress = process.env.BITSENA_VESTING_ADDRESS;
    if (!vestingAddress) {
        console.error("Vesting contract address not found in .env file");
        return;
    }

    const BitsenaVesting = await ethers.getContractFactory("BitsenaVesting");
    const vesting = BitsenaVesting.attach(vestingAddress);

    // Process commands
    switch (command) {
        case "addMember": {
            const memberAddress = args[1];
            const allocation = ethers.parseEther(args[2]);

            if (!memberAddress || !args[2]) {
                console.error("Missing arguments. Usage: addMember <address> <allocation>");
                return;
            }

            console.log(`Adding team member ${memberAddress} with allocation of ${args[2]} BTS...`);
            const tx = await vesting.addTeamMember(memberAddress, allocation);
            await tx.wait();
            console.log(`Team member added successfully! Transaction: ${tx.hash}`);
            break;
        }

        case "updateMember": {
            const memberAddress = args[1];
            const newAllocation = ethers.parseEther(args[2]);

            if (!memberAddress || !args[2]) {
                console.error("Missing arguments. Usage: updateMember <address> <allocation>");
                return;
            }

            console.log(`Updating team member ${memberAddress} with new allocation of ${args[2]} BTS...`);
            const tx = await vesting.updateTeamMemberAllocation(memberAddress, newAllocation);
            await tx.wait();
            console.log(`Team member updated successfully! Transaction: ${tx.hash}`);
            break;
        }

        case "removeMember": {
            const memberAddress = args[1];

            if (!memberAddress) {
                console.error("Missing arguments. Usage: removeMember <address>");
                return;
            }

            console.log(`Removing team member ${memberAddress}...`);
            const tx = await vesting.removeTeamMember(memberAddress);
            await tx.wait();
            console.log(`Team member removed successfully! Transaction: ${tx.hash}`);
            break;
        }

        case "listMembers": {
            const memberCount = await vesting.getTeamMemberCount();
            console.log(`Total team members: ${memberCount}`);

            for (let i = 0; i < memberCount; i++) {
                const memberAddress = await vesting.getTeamMemberAtIndex(i);
                const memberInfo = await vesting.teamMembers(memberAddress);

                const totalAllocation = ethers.formatEther(memberInfo.totalAllocation);
                const amountClaimed = ethers.formatEther(memberInfo.amountClaimed);
                const isActive = memberInfo.isActive;

                console.log(`
Member #${i + 1}:
  Address: ${memberAddress}
  Total Allocation: ${totalAllocation} BTS
  Amount Claimed: ${amountClaimed} BTS
  Active: ${isActive}
        `);
            }
            break;
        }

        case "getMemberInfo": {
            const memberAddress = args[1];

            if (!memberAddress) {
                console.error("Missing arguments. Usage: getMemberInfo <address>");
                return;
            }

            const memberInfo = await vesting.teamMembers(memberAddress);
            const claimableAmount = await vesting.getClaimableAmount(memberAddress);
            const vestedAmount = await vesting.getVestedAmount(memberAddress);

            console.log(`
Member Information for ${memberAddress}:
  Total Allocation: ${ethers.formatEther(memberInfo.totalAllocation)} BTS
  Amount Claimed: ${ethers.formatEther(memberInfo.amountClaimed)} BTS
  Active: ${memberInfo.isActive}
  Claimable Amount: ${ethers.formatEther(claimableAmount)} BTS
  Total Vested Amount: ${ethers.formatEther(vestedAmount)} BTS
      `);
            break;
        }

        default:
            console.error(`Unknown command: ${command}`);
            break;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });