// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TontineVault is Ownable {
    string public tontineId;
    uint256 public currentCycle;
    uint256 public totalContributions;

    // cycleNumber => memberAddress => proofHash
    mapping(uint256 => mapping(address => bytes32)) public contributionProofs;

    event ContributionRecorded(uint256 indexed cycleNumber, address indexed memberAddress, bytes32 proofHash);
    event CycleAdvanced(uint256 newCycle);

    constructor(string memory _tontineId) Ownable(msg.sender) {
        tontineId = _tontineId;
        currentCycle = 1;
        totalContributions = 0;
    }

    function recordContribution(uint256 _cycleNumber, address _memberAddress, bytes32 _proofHash) external onlyOwner {
        require(contributionProofs[_cycleNumber][_memberAddress] == bytes32(0), "Contribution already recorded");
        
        contributionProofs[_cycleNumber][_memberAddress] = _proofHash;
        totalContributions++;

        emit ContributionRecorded(_cycleNumber, _memberAddress, _proofHash);
    }

    function advanceCycle() external onlyOwner {
        currentCycle++;
        emit CycleAdvanced(currentCycle);
    }

    function isContributionRecorded(uint256 _cycleNumber, address _memberAddress) external view returns (bool) {
        return contributionProofs[_cycleNumber][_memberAddress] != bytes32(0);
    }
}
