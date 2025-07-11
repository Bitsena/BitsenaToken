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
 * => Bitsena Contract Implementation
 */

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Bitsena is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {
    uint256 private constant _TOTAL_SUPPLY = 21_000_000_000 * 10**18; // 21 billion tokens
    
    // Timelock for purchases during first year
    uint256 public immutable deployTime;
    uint256 public constant TIMELOCK_DURATION = 90 days;
    uint256 public constant TIMELOCK_PERIOD = 365 days;
    
    // Mapping to track locked tokens
    mapping(address => uint256) private _lockTime;
    mapping(address => uint256) private _lockedAmount;
    
    // Addresses exempt from timelock
    mapping(address => bool) private _exemptFromTimelock;
    
    // Flag to prevent adding exemptions after initial distribution
    bool public initialDistributionCompleted;
    
    // Events
    event TokensLocked(address indexed holder, uint256 amount, uint256 unlockTime);
    event TokensUnlocked(address indexed holder, uint256 amount);
    event AddressExempted(address indexed account, bool exempt);
    event InitialDistributionCompleted();
    
    constructor() 
        ERC20("Bitsena", "BTS") 
        Ownable() 
    {
        deployTime = block.timestamp;
        _mint(msg.sender, _TOTAL_SUPPLY);
    }
    
    /**
     * @dev Override totalSupply to ensure it returns the correct value
     */
    function totalSupply() public pure override returns (uint256) {
        return _TOTAL_SUPPLY;
    }
    
    /**
     * @dev Sets whether an address is exempt from the timelock
     * @param account Address to set exemption for
     * @param exempt Whether the address should be exempt
     */
    function setTimelockExemption(address account, bool exempt) external onlyOwner {
        require(!initialDistributionCompleted || _exemptFromTimelock[account] == exempt, 
                "Cannot modify exemptions after initial distribution");
        _exemptFromTimelock[account] = exempt;
        emit AddressExempted(account, exempt);
    }
    
    /**
     * @dev Batch set timelock exemptions
     * @param accounts Addresses to set exemption for
     * @param exempt Whether the addresses should be exempt
     */
    function batchSetTimelockExemption(address[] calldata accounts, bool exempt) external onlyOwner {
        require(!initialDistributionCompleted, "Cannot add exemptions after initial distribution");
        for (uint256 i = 0; i < accounts.length; i++) {
            _exemptFromTimelock[accounts[i]] = exempt;
            emit AddressExempted(accounts[i], exempt);
        }
    }
    
    /**
     * @dev Mark initial distribution as completed, preventing further exemption modifications
     */
    function completeInitialDistribution() external onlyOwner {
        initialDistributionCompleted = true;
        emit InitialDistributionCompleted();
    }
    
    /**
     * @dev Checks if an address is exempt from timelock
     * @param account Address to check
     * @return Whether the address is exempt
     */
    function isExemptFromTimelock(address account) public view returns (bool) {
        return _exemptFromTimelock[account];
    }
    
    /**
     * @dev Get the unlock time for an address
     * @param account Address to check
     * @return Timestamp when tokens will be unlocked
     */
    function getUnlockTime(address account) public view returns (uint256) {
        return _lockTime[account];
    }
    
    /**
     * @dev Get the amount of locked tokens for an address
     * @param account Address to check
     * @return Amount of locked tokens
     */
    function getLockedAmount(address account) public view returns (uint256) {
        if (block.timestamp >= _lockTime[account]) {
            return 0;
        }
        return _lockedAmount[account];
    }
    
    /**
     * @dev Check if timelock is active
     * @return Whether timelock is still active
     */
    function isTimelockActive() public view returns (bool) {
        return block.timestamp < deployTime + TIMELOCK_PERIOD;
    }
    
    /**
     * @dev Override transfer function to implement timelock
     */
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _transferWithTimelock(_msgSender(), recipient, amount);
        return true;
    }
    
    /**
     * @dev Override transferFrom function to implement timelock
     */
    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        _transferWithTimelock(sender, recipient, amount);
        _spendAllowance(sender, _msgSender(), amount);
        return true;
    }
    
    /**
     * @dev Internal function to handle transfers with timelock
     */
    function _transferWithTimelock(address sender, address recipient, uint256 amount) internal {
        // If timelock period is over or sender is exempt, proceed with normal transfer
        if (!isTimelockActive() || isExemptFromTimelock(sender)) {
            _transfer(sender, recipient, amount);
            return;
        }
        
        // Check if sender has locked tokens
        uint256 lockedAmount = getLockedAmount(sender);
        uint256 availableAmount = balanceOf(sender) - lockedAmount;
        
        // Ensure sender has enough unlocked tokens
        require(availableAmount >= amount, "BTS: transfer amount exceeds unlocked balance");
        
        // Proceed with transfer
        _transfer(sender, recipient, amount);
        
        // If recipient is not exempt, lock the received tokens
        if (!isExemptFromTimelock(recipient)) {
            uint256 newLockTime = block.timestamp + TIMELOCK_DURATION;
            _lockTime[recipient] = newLockTime;
            _lockedAmount[recipient] = _lockedAmount[recipient] + amount;
            
            emit TokensLocked(recipient, amount, newLockTime);
        }
    }
    
    /**
     * @dev Batch transfer function for efficiency
     */
    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) external nonReentrant returns (bool) {
        require(recipients.length == amounts.length, "BTS: recipients and amounts length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            transfer(recipients[i], amounts[i]);
        }
        
        return true;
    }
    
    /**
     * @dev Batch approve function
     */
    function batchApprove(address[] calldata spenders, uint256[] calldata amounts) external nonReentrant returns (bool) {
        require(spenders.length == amounts.length, "BTS: spenders and amounts length mismatch");
        
        for (uint256 i = 0; i < spenders.length; i++) {
            approve(spenders[i], amounts[i]);
        }
        
        return true;
    }
}