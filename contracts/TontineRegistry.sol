// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TontineRegistry is Ownable {
    mapping(bytes32 => address) public vaults;
    bytes32[] public allTontineIds;

    event TontineRegistered(bytes32 indexed tontineId, address indexed vaultAddress);

    constructor() Ownable(msg.sender) {}

    function register(bytes32 tontineId, address vaultAddress) external onlyOwner {
        require(vaults[tontineId] == address(0), "Tontine already registered");
        require(vaultAddress != address(0), "Invalid vault address");

        vaults[tontineId] = vaultAddress;
        allTontineIds.push(tontineId);

        emit TontineRegistered(tontineId, vaultAddress);
    }

    function getVault(bytes32 tontineId) external view returns (address) {
        return vaults[tontineId];
    }

    function isRegistered(bytes32 tontineId) external view returns (bool) {
        return vaults[tontineId] != address(0);
    }

    function getAllTontines() external view returns (bytes32[] memory) {
        return allTontineIds;
    }
}
