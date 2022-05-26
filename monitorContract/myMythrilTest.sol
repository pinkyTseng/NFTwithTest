// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


library SafeMath {

  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a * b;
    require(c / a == b);

    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b > 0); // Solidity only automatically asserts when dividing by 0
    uint256 c = a / b;
    
    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint256) {    
    return a - b;
  }

  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    return a + b;    
  }

//   function sub(uint256 a, uint256 b) internal pure returns (uint256) {
//     require(b <= a); // underflow 
//     uint256 c = a - b;

//     return c;
//   }

//   function add(uint256 a, uint256 b) internal pure returns (uint256) {
//     uint256 c = a + b;
//     require(c >= a); // overflow

//     return c;
//   }

  function mod(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b != 0);
    return a % b;
  }
}


contract Token{

using SafeMath for uint;


  
//   function mul(uint256 a, uint256 b) internal pure returns (uint256) {
//     uint256 c = a * b;
//     require(c / a == b);

//     return c;
//   }

//   function div(uint256 a, uint256 b) internal pure returns (uint256) {
//     require(b > 0); // Solidity only automatically asserts when dividing by 0
//     uint256 c = a / b;
    
//     return c;
//   }

//   function sub(uint256 a, uint256 b) internal pure returns (uint256) {
//     require(b <= a); // underflow 
//     uint256 c = a - b;

//     return c;
//   }

//   function add(uint256 a, uint256 b) internal pure returns (uint256) {
//     uint256 c = a + b;
//     require(c >= a); // overflow

//     return c;
//   }

//   function mod(uint256 a, uint256 b) internal pure returns (uint256) {
//     require(b != 0);
//     return a % b;
//   }

    mapping(address => uint) public balances;
    
    constructor() public{
       balances[msg.sender] = 100;
        // balances[msg.sender] = 2**200 ;
    }
    
    function transfer(address to, uint val) public{
        // check for overflow
        if(balances[msg.sender] >= balances[to]){
            balances[msg.sender] = balances[msg.sender].sub(val);
            balances[to] = balances[to].add(val);

            // balances[msg.sender] -= val;
            // balances[to] += val;


            // balances[msg.sender] = sub(balances[msg.sender], val);
            // balances[to] = add(balances[to], val);
        }
    }
}