import React, { Component } from 'react'
import { BrowserRouter, Route, Link } from 'react-router-dom';

import Web3Status from './components/Web3Status'
import NewTrade from './components/NewTrade'
import Testing from './components/Testing'
import BrowseTrades from './components/BrowseTrades'

import getWeb3 from './utils/getWeb3'


import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class NavigationBar extends Component {
    render() {
        return(
            <nav className="navbar pure-menu pure-menu-horizontal">

                <Link to='/'>
                    <span className="pure-menu-heading pure-menu-link">Truffle Box </span>
                </Link>

                <Link to='/newTrade'>
                    <span className="pure-menu-item pure-menu-link">New Trade </span>
                </Link>

                <Link to='/browseTrades'>
                    <span className="pure-menu-item pure-menu-link">Browse Trades </span>
                </Link>

                <Link to='/testing'>
                    <span className="pure-menu-item pure-menu-link">Testing </span>
                </Link>


                <span className="pure-menu-heading navbar-right">
                    <Web3Status web3={this.props.web3} web3Connected={this.props.web3Connected}/>
                </span>
            </nav>
        );
    }
}

class Home extends Component {
    render() {
        return (
            <div>
                <h2> Etherary can do everything!</h2>
                <p>
                    For example you can browse or create trades.<br></br>

                    <Link to='/newTrade'>
                        <button className="pure-button pure-button-primary">Create Trade</button>
                    </Link>

                    <Link to='/browseTrades'>
                        <button className="pure-button pure-button-primary">Browse Trades</button>
                    </Link>
                </p>
            </div>
        );
    }
}


class App extends Component {
    constructor(props) {
        super(props)

        this.state = {
            web3: null,
            web3Connected: false
        }
    }

    componentDidMount() {
        getWeb3
        .then(results => {
            this.setState({
                web3: results.web3,
                web3Connected: results.web3 != null && results.web3.isConnected()
            })
        })
        .catch((e) => {
            console.log('Error finding web3.', e)
        })
    }

    render() {
        return (
            <div className="App">
                <NavigationBar web3={this.state.web3} web3Connected={this.state.web3Connected} />

                <main className="container">
                    <Route exact={true} path='/' render={() => (
                        <Home/>
                    )}/>

                    <Route path='/newTrade' render={() => (
                        <NewTrade web3={this.state.web3} web3Connected={this.state.web3Connected}/>
                    )}/>

                    <Route path='/browseTrades' render={() => (
                        <BrowseTrades web3={this.state.web3} web3Connected={this.state.web3Connected}/>
                    )}/>

                    <Route path='/testing' render={() => (
                        <Testing web3={this.state.web3} web3Connected={this.state.web3Connected}/>
                    )}/>
                </main>
            </div>
        );
    }
}

export default App
