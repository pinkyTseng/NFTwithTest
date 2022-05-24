// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


import "./CharlieNftFlattern.sol";

contract EchindaCase is CharlieNft {
    address echidna_caller = msg.sender;

    // update the constructor
    constructor() public CharlieNft("Charlie Nft", "CFT") {
        // owner = echidna_caller;
    }

    // add the property
    function echidna_noOverTotalCount() public view returns (bool) {
        return totalSupply() <= totalCount;
    }
}