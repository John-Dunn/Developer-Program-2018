pragma solidity ^0.4.24;

import "zeppelin/contracts/token/StandardToken.sol";

/**
 * @title Faucet Token
 * @dev Simple ERC20 Token example which can serve as a faucet. Allows anybody to request some token
 * Based on the MintableToken by OpenZeppelin: https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/token/ERC20/MintableToken.sol
 */
contract FaucetToken is StandardToken {
    event Mint(address indexed to, uint256 amount);

    uint256 constant public amountToMint = 100*10**18; 

    /**
    * @dev Function to mint token and transfer them to the message sender.
    * @return A boolean that indicates if the operation was successful.
    */
    function mint() public returns (bool) {
        return mint(msg.sender);
    }

    /**
    * @dev Function to dispense token to a specified recipient.
    * @return A boolean that indicates if the operation was successful.
    */
    function mint(address _to) public returns (bool) {
        totalSupply = totalSupply.add(amountToMint);
        balances[_to] = balances[_to].add(amountToMint);
        emit Mint(_to, amountToMint);
        emit Transfer(address(0), _to, amountToMint);
        return true;
    }


}
