// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CharlieNft is ERC721Enumerable, Ownable {

    // string public name;
    // string public symbol; 
    uint256 constant public totalCount = 10;
    uint256 constant public maxOwn = 5;
    uint256 constant public eachMintMaxCount = 2;
    string constant baseExtension = ".json";

    uint256 public sellPrice = 0.01 ether;
    bool public isSellActive = false;  
    bool public isReveal = false;

    string public unrevealedUrl = "";
    string public revealedUrl = ""; 
    mapping(address => uint256) public ownermap;

    using Strings for uint256;
    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {
        // name = name_;
        // symbol = symbol_;
    }

    function mint(uint8 count) public payable{
        require(isSellActive, "not in sell now");
        uint256 soldCount = totalSupply();
        // require(totalCount - soldCount > count, "not so many nfts");
        require(totalCount - soldCount >= count, "not so many nfts");
        require(count <= eachMintMaxCount, "over eachMintMaxCount");
        require(ownermap[msg.sender] + count <= maxOwn, "over individual maxOwn");
        require(sellPrice * count == msg.value, "paid for price wrong");

        // for (uint256 idx = soldCount; idx < soldCount + count; idx++) {
        //     _safeMint(msg.sender, idx);
        //     ownermap[msg.sender] += 1; 
        // }

        for (uint256 idx = 1; idx <=  count; idx++) {
            _safeMint(msg.sender, soldCount+idx);
            ownermap[msg.sender] += 1;
        }

        //ownermap[msg.sender] = ownermap[msg.sender] + count   
        // _safeMint(msg.sender, 1);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        string memory baseURI = "";
        if(isReveal){
            baseURI = revealedUrl;
            return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), baseExtension)) : "";
        }else{
            baseURI = unrevealedUrl;
            return baseURI;
        }
    }

    //only by owner
    function setUnrevealedUrl(string memory unrevealedUrl_) public onlyOwner{
        require(bytes(unrevealedUrl_).length > 0, "empty url error");
        unrevealedUrl = unrevealedUrl_;
    }

    function setRevealedUrl(string memory revealedUrl_) public onlyOwner{
        require(bytes(revealedUrl_).length > 0, "empty url error");
        revealedUrl = revealedUrl_;
    }

    function openSell() public onlyOwner{
        isSellActive = true;
    }

    function pauseSell() public onlyOwner{
        isSellActive = false;
    }

    function reveal() public onlyOwner{
        isReveal = true;
    }

    function withdraw() public payable onlyOwner{
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    }

}