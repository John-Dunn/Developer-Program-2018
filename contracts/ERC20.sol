pragma solidity 0.4.24;

/// @title ERC-20 Token Standard
/// @dev See https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
interface ERC20 {
    event Transfer(address indexed from, address indexed to, uint256 tokens);

    event Approval(address indexed tokenOwner, address indexed spender, uint256 tokens);

    function totalSupply() public view returns (uint256);

    function balanceOf(address tokenOwner) public view returns (uint256 balance);

    function allowance(
        address tokenOwner,
        address spender
    ) public view returns (uint256 remaining);

    function transfer(address to, uint256 tokens) public returns (bool success);

    function approve(address spender, uint256 tokens) public returns (bool success);

    function transferFrom(address from, address to, uint256 tokens) public returns (bool success);
}
