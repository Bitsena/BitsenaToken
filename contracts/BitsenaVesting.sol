// SPDX-License-Identifier: MIT
/**
 * Bitsena (BTS)
 * Bitcoin Lottery
 * Utility Token
 * Date: July 08, 2025
 * Developed by Vilmo Oliveira de Paula Junior - since 1987
 * FusionLabs Brasil Ltda.
 * www.bitsena.com.br
 * www.fusionlabs.com.br
 * => Team Token Vesting Contract
 */

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BitsenaVesting is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    IERC20 public bitsenaToken;
    
    // Vesting schedule parameters
    uint256 public vestingStart;
    uint256 public initialLockPeriod = 180 days; // 6 months lock
    uint256 public vestingPeriod = 90 days; // 3 months for each release
    uint256 public vestingReleases = 7; // 7 quarterly releases after lock (total 24 months)
    
    // Team member structure
    struct TeamMember {
        uint256 totalAllocation;
        uint256 amountClaimed;
        bool isActive;
    }
    
    mapping(address => TeamMember) public teamMembers;
    address[] public teamMemberList;
    mapping(address => uint256) public teamMemberIndex;
    uint256 public totalAllocated;
    
    event TeamMemberAdded(address indexed member, uint256 allocation);
    event TeamMemberRemoved(address indexed member);
    event TeamMemberAllocationUpdated(address indexed member, uint256 newAllocation);
    event TokensClaimed(address indexed member, uint256 amount);
    
    constructor(address tokenAddress) Ownable() {
        require(tokenAddress != address(0), "Token address cannot be zero");
        bitsenaToken = IERC20(tokenAddress);
        vestingStart = block.timestamp;
    }
    
    /**
     * @dev Add a new team member with allocation
     * @param member Address of the team member
     * @param allocation Token amount allocated to the member
     */
    function addTeamMember(address member, uint256 allocation) external onlyOwner {
        require(member != address(0), "Invalid address");
        require(allocation > 0, "Allocation must be greater than 0");
        require(!teamMembers[member].isActive, "Member already exists");
        
        // Check if we have enough tokens
        uint256 contractBalance = bitsenaToken.balanceOf(address(this));
        require(totalAllocated + allocation <= contractBalance, "Insufficient tokens for allocation");
        
        // Add member
        teamMembers[member] = TeamMember({
            totalAllocation: allocation,
            amountClaimed: 0,
            isActive: true
        });
        
        teamMemberIndex[member] = teamMemberList.length;
        teamMemberList.push(member);
        totalAllocated = totalAllocated + allocation;
        
        emit TeamMemberAdded(member, allocation);
    }
    
    /**
     * @dev Remove a team member and recover their unclaimed tokens
     * @param member Address of the team member to remove
     */
    function removeTeamMember(address member) external onlyOwner nonReentrant {
        require(teamMembers[member].isActive, "Member does not exist or already removed");
        
        uint256 unclaimedAmount = teamMembers[member].totalAllocation - teamMembers[member].amountClaimed;
        totalAllocated = totalAllocated - unclaimedAmount;
        
        // Mark as inactive
        teamMembers[member].isActive = false;
        
        // Remove from the list by swapping with the last element and popping
        uint256 indexToRemove = teamMemberIndex[member];
        uint256 lastIndex = teamMemberList.length - 1;
        
        if (indexToRemove != lastIndex) {
            address lastMember = teamMemberList[lastIndex];
            teamMemberList[indexToRemove] = lastMember;
            teamMemberIndex[lastMember] = indexToRemove;
        }
        
        teamMemberList.pop();
        delete teamMemberIndex[member];
        
        emit TeamMemberRemoved(member);
    }
    
    /**
     * @dev Update a team member's allocation
     * @param member Address of the team member
     * @param newAllocation New token allocation amount
     */
    function updateTeamMemberAllocation(address member, uint256 newAllocation) external onlyOwner nonReentrant {
        require(teamMembers[member].isActive, "Member does not exist or inactive");
        require(newAllocation > teamMembers[member].amountClaimed, "New allocation must be greater than claimed amount");
        
        uint256 oldAllocation = teamMembers[member].totalAllocation;
        uint256 allocationDifference;
        
        if (newAllocation > oldAllocation) {
            allocationDifference = newAllocation - oldAllocation;
            uint256 contractBalance = bitsenaToken.balanceOf(address(this));
            require(totalAllocated + allocationDifference <= contractBalance, "Insufficient tokens for new allocation");
            totalAllocated = totalAllocated + allocationDifference;
        } else {
            allocationDifference = oldAllocation - newAllocation;
            totalAllocated = totalAllocated - allocationDifference;
        }
        
        teamMembers[member].totalAllocation = newAllocation;
        
        emit TeamMemberAllocationUpdated(member, newAllocation);
    }
    
    /**
     * @dev Claim available tokens based on vesting schedule
     */
    function claimTokens() external nonReentrant {
        TeamMember storage member = teamMembers[msg.sender];
        require(member.isActive, "Not an active team member");
        
        uint256 claimableAmount = getClaimableAmount(msg.sender);
        require(claimableAmount > 0, "No tokens available to claim");
        
        member.amountClaimed = member.amountClaimed + claimableAmount;
        bitsenaToken.safeTransfer(msg.sender, claimableAmount);
        
        emit TokensClaimed(msg.sender, claimableAmount);
    }
    
    /**
     * @dev Calculate claimable amount for a team member
     * @param memberAddress Address of the team member
     * @return Amount of tokens that can be claimed
     */
    function getClaimableAmount(address memberAddress) public view returns (uint256) {
        TeamMember storage member = teamMembers[memberAddress];
        if (!member.isActive) return 0;
        
        // If still in initial lock period, nothing can be claimed
        if (block.timestamp < vestingStart + initialLockPeriod) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - vestingStart;
        uint256 vestedPeriods = (timeElapsed - initialLockPeriod) / vestingPeriod;
        
        // Cap at max number of releases
        if (vestedPeriods > vestingReleases) {
            vestedPeriods = vestingReleases;
        }
        
        uint256 vestedAmount = member.totalAllocation * (vestedPeriods + 1) / (vestingReleases + 1);
        uint256 claimableAmount = vestedAmount - member.amountClaimed;
        
        return claimableAmount;
    }
    
        /**
     * @dev Get total vested amount for a team member at current time
     * @param memberAddress Address of the team member
     * @return Total vested amount
     */
    function getVestedAmount(address memberAddress) public view returns (uint256) {
        TeamMember storage member = teamMembers[memberAddress];
        if (!member.isActive) return 0;
        
        // If still in initial lock period, nothing is vested
        if (block.timestamp < vestingStart + initialLockPeriod) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - vestingStart;
        uint256 vestedPeriods = (timeElapsed - initialLockPeriod) / vestingPeriod;
        
        // Cap at max number of releases
        if (vestedPeriods > vestingReleases) {
            vestedPeriods = vestingReleases;
        }
        
        return member.totalAllocation * (vestedPeriods + 1) / (vestingReleases + 1);
    }
    
    /**
     * @dev Get team member count
     * @return Number of team members
     */
    function getTeamMemberCount() external view returns (uint256) {
        return teamMemberList.length;
    }
    
    /**
     * @dev Get active team member count
     * @return Number of active team members
     */
    function getActiveTeamMemberCount() external view returns (uint256) {
        return teamMemberList.length;
    }
    
    /**
     * @dev Get team member at specific index
     * @param index Index in the team member list
     * @return Address of the team member
     */
    function getTeamMemberAtIndex(uint256 index) external view returns (address) {
        require(index < teamMemberList.length, "Index out of bounds");
        return teamMemberList[index];
    }
    
    /**
     * @dev Emergency function to recover tokens
     * @param tokenAddress Address of the token to recover
     * @param amount Amount to recover
     * @param recipient Address to send recovered tokens to
     */
    function recoverTokens(address tokenAddress, uint256 amount, address recipient) external onlyOwner nonReentrant {
        require(recipient != address(0), "Cannot recover to zero address");
        
        // If recovering Bitsena tokens, ensure we don't take allocated tokens
        if (tokenAddress == address(bitsenaToken)) {
            uint256 contractBalance = bitsenaToken.balanceOf(address(this));
            require(amount <= contractBalance - totalAllocated, "Cannot recover allocated tokens");
        }
        
        IERC20(tokenAddress).safeTransfer(recipient, amount);
    }
}