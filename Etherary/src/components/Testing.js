import React, { Component } from 'react'
import { FormGroup, Col, Button } from 'reactstrap';

import {getContractInstance} from '../utils/getContractInstance'
import getLogs from '../utils/getLogs'

import ERC721FaucetA from '../../build/contracts/GenericERC721TokenA.json'
import ERC721FaucetB from '../../build/contracts/GenericERC721TokenB.json'



//Props: web3, web3Connected

class Testing extends Component {
    // Lifecycle methods
    constructor(props) {
        super(props);
        this.state = {
            faucetInstanceA: null,
            faucetAddressA: null,
            tokenBalanceA: null,
            justMintedA: false,
            latestMintedTokenA: null,

            faucetInstanceB: null,
            faucetAddressB: null,
            tokenBalanceB: null,
            justMintedB: false,
            latestMintedTokenB: null,

            account: null
        }
    }

    componentDidMount() {
        if(this.props.web3Connected) {
            this.startup();
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.web3 !== prevProps.web3) {
            console.log("Web3 change: ", this.props.web3)
            this.startup();
        }
    }

    // Tools
    instantiateContracts() {
        var faucetAddressA = ERC721FaucetA.networks[this.props.web3.version.network].address;
        var faucetInstanceA = getContractInstance(ERC721FaucetA, this.props.web3);

        var faucetAddressB = ERC721FaucetB.networks[this.props.web3.version.network].address;
        var faucetInstanceB = getContractInstance(ERC721FaucetB, this.props.web3);

        this.setState({
            faucetInstanceA: faucetInstanceA,
            faucetAddressA: faucetAddressA,

            faucetInstanceB: faucetInstanceB,
            faucetAddressB: faucetAddressB
        })
        return [faucetInstanceA, faucetInstanceB];
    }


    startup() {
        var account = this.props.web3.eth.accounts[0];
        this.setState({
            account: account
        });
        var faucets = this.instantiateContracts();
        var instanceA = faucets[0];
        var instanceB = faucets[1];

        instanceA.balanceOf(account)
        .then(function(result) {
            console.log("Faucet A token balance updated: ", result.toNumber());
            this.setState({
                tokenBalanceA: result.toNumber()
            })
        }.bind(this))

        instanceB.balanceOf(account)
        .then(function(result) {
            console.log("Faucet B token balance updated: ", result.toNumber());
            this.setState({
                tokenBalanceB: result.toNumber()
            })
        }.bind(this))
    }


    // Action handlers
    handleMintA() {
        this.setState({
            justMintedA: false,
            justMintedB: false
        })

        var instance = this.state.faucetInstanceA;
        var account = this.state.account;
        instance.mint({from:this.state.account})
        // Get minted token number for UI
        .then(function(result) {
            console.log("Minting successful", result);
            var txLogs = getLogs(result);
            this.setState({
                justMintedA: true,
                latestMintedTokenA: txLogs[0].args._tokenId.toNumber()
            })
            // The gas in the following line is to prevent caching
            // see https://github.com/ethereum/web3.js/issues/1463
            return instance.balanceOf.call(account, {gas: 500000+Math.floor(Math.random()*1001)})
        }.bind(this))
        .then(function(result) {
            var balance = result.toNumber();
            console.log("Faucet token balance updated: ", balance);
            this.setState({
                tokenBalanceA: result.toNumber()
            })
        }.bind(this))
    }

    handleMintB() {
        this.setState({
            justMintedA: false,
            justMintedB: false
        })

        var instance = this.state.faucetInstanceB;
        var account = this.state.account;
        instance.mint({from:this.state.account})
        // Get minted token number for UI
        .then(function(result) {
            console.log("Minting successful", result);
            var txLogs = getLogs(result);
            this.setState({
                justMintedB: true,
                latestMintedTokenB: txLogs[0].args._tokenId.toNumber()
            })
            // The gas in the following line is to prevent caching
            // see https://github.com/ethereum/web3.js/issues/1463
            return instance.balanceOf.call(account, {gas: 500000+Math.floor(Math.random()*1001)})
        }.bind(this))
        .then(function(result) {
            var balance = result.toNumber();
            console.log("Faucet token balance updated: ", balance);
            this.setState({
                tokenBalanceB: result.toNumber()
            })
        }.bind(this))
    }


    mintMessage() {
        if (!this.state.justMintedA && !this.state.justMintedB) {
                return (<p></p>);
        }

        if (this.state.justMintedA) {
            return(<p>Minting successful. You received the ant token with id <strong>{this.state.latestMintedTokenA}</strong>.</p>)
        }

        if (this.state.justMintedB) {
            return(<p>Minting successful. You received the beaver token with id <strong>{this.state.latestMintedTokenA}</strong>.</p>)
        }
    }


    render() {
        if(!this.props.web3Connected) {
            return (
                <div> Please establish web3 connection </div>
            )
        }

        return (
            <div>
                <p>
                    In order to test the trading functionality there are two ERC721 token contracts deployed.
                    You can think of the tokens from these contracts as CryptoAnts and CryptoBeavers.
                    Using the buttons below you can receive as many token as you like, feel free to play around with the contract.
                </p>

                <h5> CryptoAnts </h5>
                <p> The ERC721 token contract is deployed at <strong>{this.state.faucetAddressA}</strong> where you currently
                own <strong>{this.state.tokenBalanceA}</strong> ant token.</p>
                <br></br>




                <h5> CryptoBeavers </h5>
                <p> The ERC721 token contract is deployed at <strong>{this.state.faucetAddressB}</strong> where you currently
                own <strong>{this.state.tokenBalanceB}</strong> ant beaver token.</p>
                <br></br>

                <div className="centered">
                <br></br>
                    <FormGroup row>
                      <Col sm={3}>
                      <Button color="primary" size="lg" onClick={this.handleMintA.bind(this)} >Mint an ant</Button>{'     '}
                      </Col>

                      <Col sm={3}>
                      </Col>

                      <Col sm={3}>
                      <Button color="primary" size="lg" onClick={this.handleMintB.bind(this)} >Mint a beaver</Button>
                      </Col>

                    </FormGroup>

                </div>
                {this.mintMessage()}
            </div>
        );
    }
}

export default Testing
// <Button color="primary" size="lg" onClick={this.handleMintA.bind(this)} >Mint an ant</Button>{'     '}
// <Button color="primary" size="lg" onClick={this.handleMintB.bind(this)} >Mint a beaver</Button>
