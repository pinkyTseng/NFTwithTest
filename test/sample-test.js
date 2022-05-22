const { expect, util, assert } = require("chai");
const { ethers, waffle } = require("hardhat");
require('dotenv').config();

const UnrevealedUrl = process.env.UnrevealedUrl
const RevealedUrl = process.env.RevealedUrl
const nftName = "charlie NFT"
const nftSymbol = "CFT"

const provider = waffle.provider;

// const { accounts, contract } = require('@openzeppelin/test-environment');
// const [ owner ] = accounts;

// const CharlieNft = contract.fromArtifact('CharlieNft'); // Loads a compiled contract

// describe('Openzeppelin', function () {
//   it('Openzeppelin test', async function () {
//     const charlieNft = await CharlieNft.new({ from: owner });
//     expect(await charlieNft.owner()).to.equal(owner);
//   });
// });

describe("CharlieNft", function () {
  let charlieNft;
  let owner, user1, user2, users;

  

  describe("happy path flow", async function () {

    beforeEach(async () => {
      console.log("beforeEach run");
      [owner, user1, user2, ...users] = await ethers.getSigners();
      const CharlieNft = await ethers.getContractFactory("CharlieNft");
      charlieNft = await CharlieNft.deploy(nftName, nftSymbol);
      await charlieNft.deployed();
      await charlieNft.setUnrevealedUrl(UnrevealedUrl);
      await charlieNft.setRevealedUrl(RevealedUrl);
      
    });

    it("self mint 1 nft", async function () {      
      let balanceInWeiOld = await provider.getBalance(charlieNft.address);
      
      await charlieNft.openSell();      
      await charlieNft.mint(1, {value: ethers.utils.parseEther('0.01')} );
      let theTOkenOwner = await charlieNft.ownerOf(1);
      expect(theTOkenOwner).to.be.equal(owner.address);
      expect(1).to.equal(await charlieNft.totalSupply());

      let balanceInWei = await provider.getBalance(charlieNft.address);
      let result = balanceInWei.sub(balanceInWeiOld)
      expect(result).to.equal(ethers.utils.parseEther('0.01'));
      // result.should.be.bignumber.equal(ethers.utils.parseEther('0.01'));
    });

    // it("other mint 1 nft", async function () {      
    //   await greeter.connect(user1)

    //   await charlieNft.openSell();
    //   await charlieNft.mint(1, {value: ethers.utils.parseEther('0.01')} );
    //   let theTOkenOwner = await charlieNft.ownerOf(1);
    //   expect(theTOkenOwner).to.be.equal(user1.address); 
    // });

    it("tokenURI test", async function () {      
      await charlieNft.openSell();
      await charlieNft.mint(1, {value: ethers.utils.parseEther('0.01')} );
      
      let url = await charlieNft.tokenURI(1);
      let targetUrl = UnrevealedUrl
      expect(url).to.equal(targetUrl);

      await charlieNft.reveal();

      url = await charlieNft.tokenURI(1);
      targetUrl = RevealedUrl + 1 + ".json"
      expect(url).to.equal(targetUrl);
    });

    it("sumple isSellActive test", async function () {      
      expect(await charlieNft.isSellActive()).to.equal(false);
      await charlieNft.openSell();
      expect(await charlieNft.isSellActive()).to.equal(true);
      await charlieNft.pauseSell();
      expect(await charlieNft.isSellActive()).to.equal(false);
    });

    it("withdraw test", async function () {      
      await charlieNft.openSell();
      await charlieNft.mint(1, {value: ethers.utils.parseEther('0.01')} );
      await charlieNft.withdraw();
      expect(1).to.equal(1);
    });


  });
});

// describe("CharlieNft2", function () {
//   let charlieNft;
//   let owner, user1, user2, users;

//   beforeEach(async () => {
//     console.log("beforeEach2 run");
//     [owner, user1, user2, ...users] = await ethers.getSigners();
//     const CharlieNft = await ethers.getContractFactory("CharlieNft");
//     charlieNft = await CharlieNft.deploy(nftName, nftSymbol);
//     await charlieNft.deployed();
//   });

//   describe("happy path flow", async function () {
//     it("happy path flow sell and mint nft success", async function () {
//       charlieNft.setUnrevealedUrl(UnrevealedUrl);
//       charlieNft.setRevealedUrl(RevealedUrl);
//       charlieNft.openSell();
//       charlieNft.mint(1, {value: ethers.utils.parseEther('0.01')} );
//       expect(1).to.be.equal(1);
//     });
//   });
// });
