const { expect, util, assert } = require("chai");
const { ethers, waffle } = require("hardhat");
require('dotenv').config();

const UnrevealedUrl = process.env.UnrevealedUrl
const RevealedUrl = process.env.RevealedUrl
const nftName = "charlie NFT"
const nftSymbol = "CFT"

const provider = waffle.provider;


async function getBeforeMintData(contractInstance, caller){
  return new Promise(async function(resolve, reject){
    try{
      let dataObj = {};
      let balanceInWei = await provider.getBalance(contractInstance.address);
      let callerOwnCount = await contractInstance.balanceOf(caller.address);
      let totalCount = await contractInstance.totalSupply();
      // console.log("balanceInWei type: " + typeof balanceInWei);
      // console.log("callerOwnCount type: " + typeof callerOwnCount);
      // console.log("totalCount type: " + typeof totalCount);
      dataObj.balanceInWei = balanceInWei;
      dataObj.callerOwnCount = callerOwnCount;
      dataObj.totalCount = totalCount;
      resolve(dataObj);
    }catch(e){
      reject(e);
    }
  });
}

//!!!! mintCount should be 0 when revert case
async function checkAfterMintData(beforData, mintCount, contractInstance, caller){
  return new Promise(async function(resolve, reject){
    try{      
      // expect(beforData.callerOwnCount + mintCount).to.equal(await contractInstance.balanceOf(caller.address));
      // expect(beforData.totalCount+ mintCount).to.equal(await contractInstance.totalSupply());

      expect(parseInt(beforData.callerOwnCount) + parseInt(mintCount)).to.equal(await contractInstance.balanceOf(caller.address));
      expect(parseInt(beforData.totalCount)+ parseInt(mintCount)).to.equal(await contractInstance.totalSupply());
          
      let balanceInWeiNew = await provider.getBalance(contractInstance.address);
      addedBalanceInWei = balanceInWeiNew.sub(beforData.balanceInWei);
      let realAddedBalanceInWei = 0.01 * mintCount;
      expect(addedBalanceInWei).to.equal(ethers.utils.parseEther(realAddedBalanceInWei.toString()));
      resolve();
    }catch(e){
      reject(e);
    }
  });
}


describe("CharlieNft", function () {
  let charlieNft;
  let owner, user1, user2, users;  

  describe("happy path flow", async function () {

    beforeEach(async () => {
      // console.log("beforeEach run");
      [owner, user1, user2, ...users] = await ethers.getSigners();
      const CharlieNft = await ethers.getContractFactory("CharlieNft");
      charlieNft = await CharlieNft.deploy(nftName, nftSymbol);
      await charlieNft.deployed();
      await charlieNft.setUnrevealedUrl(UnrevealedUrl);
      await charlieNft.setRevealedUrl(RevealedUrl);

      await charlieNft.openSell();      
    });

    it("self mint 1 nft", async function () {
      let mintCount = 1;
      let preMinedData = await getBeforeMintData(charlieNft, user1);
      let val = 0.01 * mintCount;
      let userConnrct = charlieNft;
      await userConnrct.mint(mintCount, {value: ethers.utils.parseEther( val.toString() )});
      // await expect(user1Connrct.mint(mintCount, {value: ethers.utils.parseEther( val.toString())} )) .to.be.reverted;      
      await checkAfterMintData(preMinedData, mintCount, charlieNft, owner);
    });

    it("other mint 1 nft", async function () {
      let mintCount = 1;
      let preMinedData = await getBeforeMintData(charlieNft, user1);
      let val = 0.01 * mintCount;
      let user1Connrct = await charlieNft.connect(user1);
      await user1Connrct.mint(mintCount, {value: ethers.utils.parseEther( val.toString() )});
      await checkAfterMintData(preMinedData, mintCount, charlieNft, user1);
    });
    
    it("other mint 2 nft", async function () {
      let mintCount = 2;
      let preMinedData = await getBeforeMintData(charlieNft, user1);
      let val = 0.01 * mintCount;
      let user1Connrct = await charlieNft.connect(user1);
      await user1Connrct.mint(mintCount, {value: ethers.utils.parseEther( val.toString() )});
      await checkAfterMintData(preMinedData, mintCount, charlieNft, user1);
    }); 

    it("tokenURI test", async function () {      
      // await charlieNft.openSell();
      await charlieNft.mint(1, {value: ethers.utils.parseEther('0.01')} );
      
      let url = await charlieNft.tokenURI(1);
      let targetUrl = UnrevealedUrl
      expect(url).to.equal(targetUrl);

      await charlieNft.reveal();

      url = await charlieNft.tokenURI(1);
      targetUrl = RevealedUrl + 1 + ".json"
      expect(url).to.equal(targetUrl);
    });    

    it("simple isSellActive test", async function () {
      expect(await charlieNft.isSellActive()).to.equal(true);
      await charlieNft.pauseSell();
      expect(await charlieNft.isSellActive()).to.equal(false);     
      await charlieNft.openSell();
      expect(await charlieNft.isSellActive()).to.equal(true);
    });

    it("withdraw test", async function () {      
      // await charlieNft.openSell();
      let ownerBalanceOld = await owner.getBalance()
      await charlieNft.connect(user1).mint(2, {value: ethers.utils.parseEther('0.02')} );
      await charlieNft.withdraw();
      let ownerBalance = await owner.getBalance()
      assert(ownerBalance.gt(ownerBalanceOld), 'owner not get money from contract');
    });
  });



  describe("mint excepion path flow fail right", async function () {
    beforeEach(async () => {
      // console.log("beforeEach run");
      [owner, user1, user2, ...users] = await ethers.getSigners();
      const CharlieNft = await ethers.getContractFactory("CharlieNft");
      charlieNft = await CharlieNft.deploy(nftName, nftSymbol);
      await charlieNft.deployed();
      await charlieNft.setUnrevealedUrl(UnrevealedUrl);
      await charlieNft.setRevealedUrl(RevealedUrl);

      await charlieNft.openSell();      
    });

    it("noActive can't mint", async function () {
      await charlieNft.pauseSell();
      let mintCount = 1;
      let preMinedData = await getBeforeMintData(charlieNft, user1);
      let val = 0.01 * mintCount;
      let user1Connrct = await charlieNft.connect(user1);
      await expect(user1Connrct.mint(mintCount, {value: ethers.utils.parseEther( val.toString())} )) .to.be.reverted;
      await checkAfterMintData(preMinedData, 0, charlieNft, user1);      
    });

    it("not so many nfts", async function () {
      let mintCount = 20;
      let preMinedData = await getBeforeMintData(charlieNft, user1);
      let val = 0.01 * mintCount;
      let user1Connrct = await charlieNft.connect(user1);
      await expect(user1Connrct.mint(mintCount, {value: ethers.utils.parseEther( val.toString())} )) .to.be.reverted;
      await checkAfterMintData(preMinedData, 0, charlieNft, user1);      
    });

    it("over eachMintMaxCount", async function () {         
      // await charlieNft.openSell();
      let mintCount = 3;
      let preMinedData = await getBeforeMintData(charlieNft, user1);
      let val = 0.01 * mintCount;
      let user1Connrct = await charlieNft.connect(user1);
      await expect(user1Connrct.mint(mintCount, {value: ethers.utils.parseEther( val.toString())} )) .to.be.reverted;      
      await checkAfterMintData(preMinedData, 0, charlieNft, user1);
    });

    it("over individual maxOwn", async function () {
      let mintCount = 2;
      let preMinedData = await getBeforeMintData(charlieNft, user1);
      let val = 0.01 * mintCount;
      let user1Connrct = await charlieNft.connect(user1);
      await user1Connrct.mint(mintCount, {value: ethers.utils.parseEther( val.toString() )});
      await checkAfterMintData(preMinedData, mintCount, charlieNft, user1);

      mintCount = 2;
      preMinedData = await getBeforeMintData(charlieNft, user1);
      val = 0.01 * mintCount;
      await user1Connrct.mint(mintCount, {value: ethers.utils.parseEther( val.toString() )});
      await checkAfterMintData(preMinedData, mintCount, charlieNft, user1);

      mintCount = 2;
      preMinedData = await getBeforeMintData(charlieNft, user1);
      val = 0.01 * mintCount;
      await expect(user1Connrct.mint(mintCount, {value: ethers.utils.parseEther( val.toString())} )) .to.be.reverted;
      await checkAfterMintData(preMinedData, 0, charlieNft, user1);
      
    });


    it("paid for price lower than needed", async function () {
      let mintCount = 2;
      let preMinedData = await getBeforeMintData(charlieNft, user1);
      let user1Connrct = await charlieNft.connect(user1);
      await expect(user1Connrct.mint(mintCount, {value: ethers.utils.parseEther( "0.01" )} )) .to.be.reverted;
      await checkAfterMintData(preMinedData, 0, charlieNft, user1);       
    });    

  });

  describe("other less important excepion fail right", async function () {
    beforeEach(async () => {
      // console.log("beforeEach run");
      [owner, user1, user2, ...users] = await ethers.getSigners();
      const CharlieNft = await ethers.getContractFactory("CharlieNft");
      charlieNft = await CharlieNft.deploy(nftName, nftSymbol);
      await charlieNft.deployed();        
    });

    it("setUnrevealedUrl empty", async function () {
      await expect(charlieNft.setUnrevealedUrl("")) .to.be.reverted;      
    });

    it("setRevealedUrl empty", async function () {
      await expect(charlieNft.setRevealedUrl("")) .to.be.reverted;      
    });

    it("ERC721Metadata: URI query for nonexistent token", async function () {
      await expect(charlieNft.tokenURI(1)) .to.be.reverted;      
    });
  });


});

