import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import MemoryToken from '../abis/MemoryToken.json'
import brain from '../brain.png'
import * as gameModule from '../game-module'
import {Token} from "../token/index.mjs";

const CARD_ARRAY = [
  {
    name: 'pirmais',
    img: '/images/pirmais.png'
  },
  {
    name: 'otrais',
    img: '/images/otrais.png'
  },
  {
    name: 'tresais',
    img: '/images/tresais.png'
  },
  {
    name: 'ceturtais',
    img: '/images/ceturtais.png'
  },
  {
    name: 'piektais',
    img: '/images/piektais.png'
  },
  {
    name: 'sestais',
    img: '/images/sestais.png'
  },
  {
    name: 'astotais',
    img: '/images/astotais.png'
  },
  {
    name: 'devitais',
    img: '/images/devitais.png'
  },
  {
    name: 'desmitais',
    img: '/images/desmitais.png'
  },
  {
    name: 'pirmais',
    img: '/images/pirmais.png'
  },
  {
    name: 'septitais',
    img: '/images/septitais.png'
  },
  {
    name: 'tresais',
    img: '/images/tresais.png'
  }
]

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    this.setState({ cardArray: CARD_ARRAY.sort(() => 0.5 - Math.random()) })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    // Load smart contract
    const networkId = await web3.eth.net.getId()
    const networkData = MemoryToken.networks[networkId]
    if(networkData) {
      const abi = MemoryToken.abi
      const address = networkData.address
      const token = new web3.eth.Contract(abi, address)
      this.setState({ token })
      const totalSupply = await token.methods.totalSupply().call()
      this.setState({ totalSupply })
      // Load Tokens
      let balanceOf = await token.methods.balanceOf(accounts[0]).call()
      for (let i = 0; i < balanceOf; i++) {
        let id = await token.methods.tokenOfOwnerByIndex(accounts[0], i).call()
        let tokenURI = await token.methods.tokenURI(id).call()
        this.setState({
          tokenURIs: [...this.state.tokenURIs, tokenURI]
        })
      }
    } else {
      alert('Smart contract not deployed to detected network.')
    }
  }

  startGame() {
    const tokens = this.state.tokenURIs.map(url => Token.fromUrl(url));
    const game = gameModule.NewGame(new gameModule.Solidity(tokens));
    this.setState({
      game
    })
    this.setState({
      currentGameState: game.getState()
    })
    this.state.gameStarted = true;
  }

  updateState() {
    const state = this.state.game.getState()
    if (state.winState != null) {
      alert("Winner is " + state.winState);
      this.setState({
        gameStarted: false,
      })
    }
    this.setState({
      currentGameState: state,
    })
  }

  mintToken() {
    const randomToken = CARD_ARRAY[Math.floor(Math.random() * CARD_ARRAY.length)];
    const randomStat = () => Math.floor(1 + Math.random() * 10);

    const token = new Token({
      img: window.location.origin + randomToken.img.toString(),
      hp: randomStat(),
      dmg: randomStat(),
    })

    this.state.token.methods.mint(
        this.state.account,
        token.toUrl()
    )
        .send({ from: this.state.account })
        .on('transactionHash', (hash) => {
          this.setState({
            tokenURIs: [...this.state.tokenURIs, token.toUrl()]
          })
        })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      token: null,
      totalSupply: 0,
      tokenURIs: [],
      cardArray: [],
      cardsChosen: [],
      cardsChosenId: [],
      cardsWon: [],
      gameStarted: false,
      currentGameState: {},
      activeCard: {},
    }
    // this.game = gameModule.NewGame(new gameModule.Solidity(this.state.tokenURIs));
    // this.currentGameState = this.game.getState();
    this.mintToken = this.mintToken.bind(this);
    this.startGame = this.startGame.bind(this);
    this.updateState = this.updateState.bind(this);

  }

  render() {
    if (this.state.gameStarted) {
      const passTurn = () => {
        this.state.game.pass()
        this.updateState()
      }

      console.log("curr GameState", this.state.currentGameState);

      const message = this.state.currentGameState.message;
      const playerCards = this.state.currentGameState.player.hand.cards;
      const playerCardsView = playerCards.map((card) => {
            const click = () => {
              const res = this.state.game.playCard(card.id)
              this.updateState()
            }
            return <button onClick={click} className="btn btn-*">
              <div className="border m-2 p-3 card-hover">
                <p>{card.currentHp}/{card.hp} ♡ {card.damage} ⚔ </p>
                <img src={card.image} width="60" height="60" className="d-inline-block align-top" alt="" />
              </div>
            </button>
          });
      const playerActiveCards = this.state.currentGameState.board.playerCards;
      const playerActiveCardsList = playerActiveCards.map(card => {
        const click = () => {
          clearInterval(this.state.clearInterval)
          this.state.clearInterval = setInterval(() => {
            if (this.state.activeCard !== {} || this.state.activeCard !== card) {
              this.setState({activeCard: {}})
            }
          }, 1000);
          this.setState({
            activeCard: card,
          })
        }
        return       <button onClick={click} className="btn btn-*">
          <div className="border m-2 p-3 card-hover">
            <p hidden={this.state.activeCard.id !== card.id}>Active</p>
            <p>{card.currentHp}/{card.hp} ♡ </p>
            <p>{card.damage} ⚔ </p>
            <img src={card.image} width="60" height="60" className="d-inline-block align-top" alt="" />
          </div>
        </button>
      });

      const enemyActiveCards = this.state.currentGameState.board.enemyCards;
      const enemyActiveCardsList = enemyActiveCards.map(card => {
        const click = () => {
          const activeCard = this.state.activeCard;
          this.state.game.attackCard(activeCard.id, card.id)
          this.updateState()
        }

        return <button onClick={click} className="btn btn-*">
          <div className="border m-2 p-3 card-hover">
            <p>{card.currentHp}/{card.hp} ♡ </p>
            <p>{card.damage} ⚔ </p>
            <img src={card.image} width="60" height="60" className="d-inline-block align-top" alt="" />
          </div>
        </button>
      });

      const clickOnBoss = () => {
        const activeCard = this.state.activeCard;
        this.state.game.attackPlayer(activeCard.id)
        this.updateState()
      }

      var enemyCards = new Array()
      for(var i = 0; i < this.state.currentGameState.enemy.cardsInHand; i++) {
        enemyCards.push("enemy card")
      }
      const enemyCardsView = enemyCards.map(card =>
      <button className="btn btn-*">
          <div className="border m-2 p-3 card-hover">
            <p>{card}</p>
            <img src={brain} width="60" height="60" className="d-inline-block align-top" alt="" />
          </div>
          </button>
      );
      return (
          <div>
            <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
              <a
                  className="navbar-brand col-sm-3 col-md-2 mr-0"
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
              >
                <img src={brain} width="30" height="30" className="d-inline-block align-top" alt="" />
                &nbsp; {message}
              </a>
              <ul className="navbar-nav px-3">
                <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                  <small className="text-muted"><span id="account">{this.state.account}</span></small>
                </li>
              </ul>
            </nav>
            <div className="container-fluid mt-5">
              <div className="row">
                <main role="main" className="col-lg-12 d-flex text-center">
                  <div className="content mr-auto ml-auto">
                    <h1 className="d-4">Fox fight!</h1>

                    <div className="row m-2" >
                      <div><h3 className="d-4">Enemy Cards</h3>
                        <h3 > hp: {this.state.currentGameState.enemy.currentHp}</h3>
                        <button onClick={clickOnBoss} className="btn btn-danger">
                        <img src={brain} width="60" height="60" className="d-inline-block align-top" alt="" />
                        </button>
                      </div>

                      <div className="d-flex">  { enemyCardsView} </div>


                    </div>

                    <div className="d-block m-2 size-200 border">
                      {enemyActiveCardsList}
                    </div>
                    <div className="d-block m-2 size-200 border">
                      { playerActiveCardsList}
                    </div>
                    <div className="row m-2" >
                      <div><h3 className="d-4 mt-3">Player Cards</h3>
                        <h3 > hp: {this.state.currentGameState.player.currentHp}</h3>
                      </div>

                      <div className="d-flex"> { playerCardsView } </div>


                    </div>
                  <button onClick={passTurn}>Pass turn</button>
                  </div>

                </main>
              </div>
            </div>
          </div>
      );
    }
    const tokens = this.state.tokenURIs.map(url => Token.fromUrl(url));
                      const tokensView = tokens.map(token =>
                         <button className="btn btn-*">
                         <div className="border m-2 p-3 card-hover">
                         <p>{token.hp} ♡ </p>
                         <p>{token.dmg} ⚔ </p>
                         <img src={token.img} width="60" height="60" className="d-inline-block align-top" alt="" />
                         </div>
                        </button>
                        );

    return (
        <div>
          <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
            <a
                className="navbar-brand col-sm-3 col-md-2 mr-0"
                href="#"
                target="_blank"
                rel="noopener noreferrer"
            >
              <img src={brain} width="30" height="30" className="d-inline-block align-top" alt="" />
              &nbsp; The Raccoons 2022 NFT GAME
            </a>
            <ul className="navbar-nav px-3">
              <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                <small className="text-muted"><span id="account">{this.state.account}</span></small>
              </li>
            </ul>
          </nav>
          <div className="container-fluid mt-5">
            <div className="row">
              <main role="main" className="col-lg-12 d-flex text-center">
                <div className="content mr-auto ml-auto">
                  <h1 className="d-4">Fox fight!</h1>
                  <div>

                  <button className="btn btn-primary mr-2" hidden={this.state.gameStarted} disabled={this.state.gameStarted} onClick={this.startGame}>Start game</button>
                  <button className="btn btn-primary" hidden={this.state.gameStarted} disabled={this.state.gameStarted} onClick={this.mintToken}>Mint new card</button>
                  </div>
                  <div className="row m-2" >
                     {tokensView}

                  </div>

                </div>

              </main>
            </div>
          </div>
        </div>
    );
  }
}

export default App;
