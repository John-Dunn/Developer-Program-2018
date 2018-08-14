import React, { Component } from 'react'
import { Form, FormGroup, Label, Input, FormFeedback, FormText, Col, Button} from 'reactstrap';

import ValidationStatus from '../utils/enums'
import didEventOccur from '../utils/didEventOccur'
import getLogs from '../utils/getLogs'
import {getContractInstance, instantiateContractAt} from '../utils/getContractInstance'

import ERC721 from '../resources/ERC721Basic.json'
import Etherary from '../../build/contracts/Etherary.json'





class NewTrade extends Component {

    constructor(props) {
        super(props);

        this.state = {
            // Step 1
            tokenContract: null,
            validContractAndTokenOwned: ValidationStatus.unchecked,
            makerTokenId: null,

            // Step 2
            takerTokenId: null,
            takerTokenIdExists: ValidationStatus.unchecked,

            // Step 3
            withdrawalApproved: false,
            tradeCreated: false,
            tradeId: -1
        }
    }


    // Handlers for Step 1
    handleTokenContractChange(event) {
        this.setState({
            tokenContract: event.target.value,
            validContractAndTokenOwned: ValidationStatus.unchecked,
            takerTokenIdExists: ValidationStatus.unchecked,
            withdrawalApproved: false,
            tradeCreated: false
        });
    }

    handleMakerTokenIdChange(event) {
      this.setState({
          makerTokenId: event.target.value,
          validContractAndTokenOwned: ValidationStatus.unchecked,
          withdrawalApproved: false,
          tradeCreated: false
      });
    }

    handleCheckOwnership(event) {
        var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, this.state.tokenContract);

        ERC721Instance.ownerOf(this.state.makerTokenId)
        .then(function(owner) {
            if(owner === this.props.web3.eth.accounts[0]) {
                this.setState({validContractAndTokenOwned: ValidationStatus.valid});
            } else {
                this.setState({validContractAndTokenOwned: ValidationStatus.invalid});
            }
        }.bind(this))
        .catch(function(err) {
            console.log("Querying ownership failed: ", err);
            this.setState({validContractAndTokenOwned: ValidationStatus.invalid});
        }.bind(this))

        event.preventDefault();
    }

    // Util for step 1
    ownershipButtonDisabled() {
        return (!this.props.web3.isAddress(this.state.tokenContract) || this.state.makerTokenId == null);
    }

    contractAndMakerTokenValid() {
        return this.state.validContractAndTokenOwned === ValidationStatus.valid;
    }

    stepOne() {
        var validContract = this.props.web3.isAddress(this.state.tokenContract);
        return (
            <div>
            <h5> 1. Specify token to trade away</h5>

            <Form>
                <FormGroup row>
                  <Label for="contract" sm={2}>Contract Address</Label>
                  <Col sm={6}>
                      <Input
                        type="text"
                        id="contract"
                        valid={validContract}
                        invalid={this.state.tokenContract !== null && !validContract}
                        onChange={this.handleTokenContractChange.bind(this)}
                      />
                      <FormText>Enter the ERC721 contract address of the token you want to trade.</FormText>
                      <FormFeedback tooltip>Please enter a valid address.</FormFeedback>
                  </Col>
                </FormGroup>

                <FormGroup row>
                  <Label for="tokenId" sm={2}>Token ID</Label>
                  <Col sm={6}>
                      <Input
                        type="number"
                        id="tokenId"
                        valid={this.contractAndMakerTokenValid()}
                        invalid={this.state.validContractAndTokenOwned === ValidationStatus.invalid}
                        disabled={!validContract}
                        onChange={this.handleMakerTokenIdChange.bind(this)}
                      />
                      <FormFeedback tooltip>You must own the token you want to trade.</FormFeedback>
                      <FormText>For the contract above, provide the token ID.</FormText>
                  </Col>

                  <Col sm={2}>
                      <Button
                          disabled={this.ownershipButtonDisabled()}
                          onClick={this.handleCheckOwnership.bind(this)}
                          color={this.contractAndMakerTokenValid() ? "success" : "primary"}
                      >
                              Check Ownership
                      </Button>
                 </Col>
                </FormGroup>
             </Form>
            </div>
        );
    }






























    // Step 2
    handleTakerTokenIdChange(event) {
      this.setState({
          takerTokenId: event.target.value,
          takerTokenIdExists: ValidationStatus.unchecked,
          withdrawalApproved: false,
          tradeCreated: false
      });
    }

    handleCheckExistence(event) {
        var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, this.state.tokenContract);

        ERC721Instance.exists(this.state.takerTokenId)
        .then(function(exists) {
            if (exists) {
                this.setState({takerTokenIdExists: ValidationStatus.valid});
            } else {
                this.setState({takerTokenIdExists: ValidationStatus.invalid});
            }
        }.bind(this))
        .catch(function(error){
            console.log("Checking existence failed: ", error);
            this.setState({takerTokenIdExists: ValidationStatus.invalid});
        }.bind(this))

        event.preventDefault();
    }

    // Util for step 1
    existenceButtonDisabled() {
        return (this.state.validContractAndTokenOwned !== ValidationStatus.valid
                || this.state.takerTokenId == null);
    }

    takerTokenExists() {
        return this.state.takerTokenIdExists === ValidationStatus.valid;
    }

    stepTwo() {
        return (
            <div>
                <h5> 2. Which token do you want? </h5>
                <Form>
                    <FormGroup row>
                      <Label for="tokenId" sm={2}>Token ID</Label>
                      <Col sm={6}>
                          <Input
                            type="number"
                            id="tokenId"
                            valid={this.takerTokenExists()}
                            invalid={this.state.takerTokenIdExists === ValidationStatus.invalid}
                            disabled={this.state.validContractAndTokenOwned !== ValidationStatus.valid}
                            onChange={this.handleTakerTokenIdChange.bind(this)}
                          />
                          <FormFeedback tooltip>The token you want must exist.</FormFeedback>
                          <FormText>For the contract above, provide the ID of the token you want.</FormText>
                      </Col>

                      <Col sm={2}>
                          <Button
                              disabled={this.existenceButtonDisabled()}
                              color={this.takerTokenExists() ? "success" : "primary"}
                              onClick={this.handleCheckExistence.bind(this)}
                          >
                                  Check Existence
                          </Button>
                     </Col>
                    </FormGroup>
                </Form>
         </div>
        )
    }
















    // Step 3
    handleCreateTrade(event) {
        var EtheraryInstance = getContractInstance(Etherary, this.props.web3);

        EtheraryInstance.createERC721SellOrder(
            this.state.tokenContract,
            this.state.makerTokenId,
            this.state.takerTokenId,
            {from: this.props.web3.eth.accounts[0], gas:500000}
        ).then(function(txid) {
            var txLogs = getLogs(txid);
            var id = txLogs[0].args.orderId.toNumber();
            console.log("Trade created, id", id);
            this.setState({
                tradeId: id,
                tradeCreated: true
            })
        }.bind(this))

        event.preventDefault();
    }

    handleApproval(event) {
        var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, this.state.tokenContract);

        var etheraryAddress = Etherary.networks[this.props.web3.version.network].address;
        ERC721Instance.approve(etheraryAddress, this.state.makerTokenId, {from: this.props.web3.eth.accounts[0]})
        .then(function(txid) {
            var expectedEvent = {
                _owner: this.props.web3.eth.accounts[0],
                _approved: etheraryAddress,
                _tokenId: this.props.web3.toBigNumber(this.state.makerTokenId)
            }
            if(didEventOccur(txid, expectedEvent)) {
                this.setState({
                    withdrawalApproved: true
                })
                console.log('Token approved');
            }
        }.bind(this))
        .catch(function(error) {
            console.log('Error approving: ', error);
        });

        event.preventDefault();
    }

    // Util for step 3
    approvalButtonDisabled() {
        return (this.state.validContractAndTokenOwned !== ValidationStatus.valid
                || this.state.takerTokenIdExists !== ValidationStatus.valid);
    }

    createButtonDisabled() {
        return this.approvalButtonDisabled() || !this.state.withdrawalApproved;
    }

    tradeCreatedMessage() {
        if (!this.state.tradeCreated) {
            return (<p></p>);
        } else {
            return(
                <p>Trade successfully created! Trade id: <strong>{this.state.tradeId}</strong>.</p>
            )
        }
    }

    stepThree() {
        return (
            <div>
            <h5> 3. Create the trade </h5>
            In order to create a trade, the Etherary contract must be approved to withdraw
            your token. Once a trade is created, your token will be stored with the contract
            until you cancel your trade or if somebody fills it.
            <br></br>
            <br></br>
            <Form>
                <FormGroup row>
                <Col sm={2}>
                    <Button
                        disabled={this.approvalButtonDisabled()}
                        color={this.state.withdrawalApproved ? "success" : "primary"}
                        onClick={this.handleApproval.bind(this)}
                    >
                            Approve
                    </Button>
               </Col>

                  <Col sm={2}>
                      <Button
                          disabled={this.createButtonDisabled()}
                          color={this.state.tradeCreated ? "success" : "primary"}
                          onClick={this.handleCreateTrade.bind(this)}
                      >
                              Create Trade
                      </Button>
                 </Col>
                </FormGroup>
            </Form>


            {this.tradeCreatedMessage()}
            </div>
        )
    }


    render() {
        if(!this.props.web3Connected) {
            return (
                <div> Please establish web3 connection </div>
            )
        }
        return (
            <div>
                <p> There are three steps to creating a new trade: </p>
                {this.stepOne()}
                {this.stepTwo()}
                {this.stepThree()}
            </div>
        );
    }
}

export default NewTrade
