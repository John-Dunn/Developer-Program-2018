import React, { Component } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Col } from 'reactstrap';

// Custom Components
import TradeCardContent from './TradeCardContent'

// Utils
import didEventOccur from '../../utils/didEventOccur'
import {getContractInstance, instantiateContractAt} from '../../utils/getContractInstance'
import {
    tradeToMaker,
    tradeToMakerContract,
    tradeToTakerContract,
    tradeToIsMakerContractERC20,
    tradeToIsTakerContractERC20,
    tradeToMakerTokenId,
    tradeToTakerTokenId,
    tradeToActive,
    tradeToTaker
} from '../../utils/tradeUnpacking'

// Contracts
import ERC721 from '../../resources/ERC721Basic.json'
import ERC20 from '../../resources/ERC20Basic.json'
import Etherary from '../../../build/contracts/Etherary.json'



// This modal pops up when pressing the Trade button on an active trade. If owning the
// wanted token, allows approving it and completing the trade
class ActiveTradeModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            withdrawalApproved: false,
            tradeCompleted: false
        }
    }


    ownershipMessage() {
        if(this.state.tradeCompleted && tradeToIsMakerContractERC20(this.props.trade)) {
            return (
                <font color="green"> <strong> Trade completed! You now own
                token {this.props.web3.fromWei(tradeToMakerTokenId(this.props.trade))}. Go to your trades to
                withdraw your token.</strong> </font>
            );
        }

        if(this.state.tradeCompleted && tradeToIsMakerContractERC20(this.props.trade)) {
            return (
                <font color="green"> <strong> Trade completed! You now own
                token #{tradeToMakerTokenId(this.props.trade)}. Go to your trades to
                withdraw your token.</strong> </font>
            );
        }

        if (this.props.ownsTakerToken) {
            return (<font color="green"> <strong>You own this token. </strong>   </font>);
        } else {
            return (<font color="red"> <strong>You do not own the wanted token.</strong>  </font>);
        }
    }

    instructionMessage() {
        if(this.props.ownsTakerToken) {
            return(
                <span> Please review the trade details. If you would like to continue,
                you need to approve your token to be transferred before completing the trade.
                <br></br>
                <br></br>
                </span>
            )
        }
    }



    handleApproval(event) {
        if (tradeToIsTakerContractERC20(this.props.trade)) {
            this.handleApprovalERC20(event);
        } else {
            this.handleApprovalERC721(event);
        }
    }

    handleApprovalERC721(event) {
        var trade = this.props.trade;
        var ERC721Instance = instantiateContractAt(ERC721, this.props.web3, tradeToTakerContract(trade));

        var etheraryAddress = Etherary.networks[this.props.web3.version.network].address;
        ERC721Instance.approve(etheraryAddress, tradeToTakerTokenId(trade), {from: this.props.web3.eth.accounts[0], gas:500000})
        .then(function(txid) {
            var expectedEvent = {
                _owner: this.props.web3.eth.accounts[0],
                _approved: etheraryAddress,
                _tokenId: this.props.web3.toBigNumber(tradeToTakerTokenId(trade))
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

    handleApprovalERC20(event) {
        var trade = this.props.trade;

        var ERC20Instance = instantiateContractAt(ERC20, this.props.web3, tradeToTakerContract(trade));

        var etheraryAddress = Etherary.networks[this.props.web3.version.network].address;
        ERC20Instance.approve(etheraryAddress, tradeToTakerTokenId(trade), {from: this.props.web3.eth.accounts[0], gas:500000})
        .then(function(txid) {
            var expectedEvent = {
                owner: this.props.web3.eth.accounts[0],
                spender: etheraryAddress,
                value: this.props.web3.toBigNumber(tradeToTakerTokenId(trade))
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






    handleCompleteTrade(event) {
        var EtheraryInstance = getContractInstance(Etherary, this.props.web3);

        EtheraryInstance.fillTrade(
            this.props.tradeId,
            // Gas estimate is ~280k but fails occasionally
            {from: this.props.web3.eth.accounts[0], gas: 300000}
        ).then(function(txid) {
            console.log('Completing trade', txid);
            var expectedEvent = {
                _tradeId: this.props.web3.toBigNumber(this.props.tradeId)
            }
            if(didEventOccur(txid, expectedEvent)) {
                this.setState({
                    tradeCompleted: true
                })
                console.log('Trade completed', txid);
                this.props.reloadCallback();
            }
        }.bind(this))

        event.preventDefault();
    }

    buttonRow() {
        if(!this.props.ownsTakerToken) {
            return <Button onClick={this.props.toggleCallback}>Go Back</Button>
        }

        return (
            <Form>
                <FormGroup row>
                    <Col sm={5}>
                        <Button
                            color={this.state.withdrawalApproved ? "success" : "primary"}
                            onClick={this.handleApproval.bind(this)}
                        >
                            Approve
                        </Button>
                    </Col>

                    <Col sm={4}>
                        <Button
                            disabled={!this.state.withdrawalApproved}
                            color={this.state.tradeCompleted ? "success" : "primary"}
                            onClick={this.handleCompleteTrade.bind(this)}
                        >
                            Complete Trade
                        </Button>
                    </Col>
                </FormGroup>
            </Form>
        )
    }

    render() {
        return (
            <Modal isOpen={this.props.show} toggle={this.props.toggleCallback}>
                <ModalHeader> Complete Trade #{this.props.tradeId} </ModalHeader>

                <ModalBody>
                    {this.ownershipMessage()}
                    <br></br> <br></br>
                    {this.instructionMessage()}
                    <TradeCardContent
                        web3={this.props.web3}
                        account={this.props.account}
                        trade={this.props.trade}
                    />
                </ModalBody>

                <ModalFooter>
                {this.buttonRow()}
                </ModalFooter>
            </Modal>
        )
    }
}


export default ActiveTradeModal;
