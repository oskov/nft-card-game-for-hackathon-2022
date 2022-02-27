
import * as State from './state.mjs'

const PLAYER_MAX_HP = 20;

const PLAYER_TURN = true;
const BOT_TURN = false;

const HAND_SIZE = 10;

const BOT_ID_OFFSET = 1 << 20; //1048576

const err = (text) => ({error: text})

class GameCard {
    constructor({id, hp, damage, image}) {
        this.id = id;
        this.hp = hp;
        this.currentHp = hp
        this.damage = damage;
        this.image = image;
    }

    fight(enemyCard) {
        enemyCard.currentHp -= this.damage
        if (enemyCard.currentHp > 0) {
            this.currentHp -= enemyCard.damage;
        }
    }
}

class Player {
    constructor(cards) {
        this.hp = PLAYER_MAX_HP;
        this.cards = {};
        for (const card of cards) {
            this.cards[card.id] = card;
        }
    }

    hasCard(cardId) {
        return cardId in this.cards;
    }

    takeCard(cardId) {
        const card = this.cards[cardId];
        delete this.cards[cardId];
        return card;
    }

    getCardList() {
        return Object.values(this.cards)
    }
}

class GameField {
    constructor() {
        this.cards = {};
    }

    push(card) {
        this.cards[card.id] = card;
    }

    hasCard(cardId) {
        return cardId in this.cards;
    }

    getCard(cardId) {
        return this.cards[cardId];
    }

    removeDeadCards() {
        for (const card of Object.values(this.cards)) {
            if (card.currentHp < 1) {
                delete this.cards[card.id];
            }
        }
    }

    getCardList() {
        return Object.values(this.cards)
    }
}

class GameState {
    constructor({humanPlayer, botPlayer}) {
        this.humanPlayer = humanPlayer;
        this.botPlayer = botPlayer;
        this.turn = PLAYER_TURN;
        this.botField = new GameField();
        this.humanField = new GameField();
    }

    getCurrentPlayer() {
        if (this.turn === PLAYER_TURN) {
            return this.humanPlayer;
        } 
        return this.botPlayer;
    }

    getCurrentOpponent() {
        if (this.turn !== PLAYER_TURN) {
            return this.humanPlayer;
        } 
        return this.botPlayer;
    }


    getPlayerField() {
        if (this.turn === PLAYER_TURN) {
            return this.humanField;
        } 
        return this.botField;
    }

    getOpponentField() {
        if (this.turn !== PLAYER_TURN) {
            return this.humanField;
        } 
        return this.botField;
    }

    nextTurn() {
        this.turn = !this.turn;
    }

    playCard(cardId) {
        const player = this.getCurrentPlayer();
        if (!player.hasCard(cardId)) {
            return err(`no card with id ${cardId}`)
        }
        const card = player.takeCard(cardId);
        const field = this.getPlayerField();
        field.push(card);
        return null
    }

    checkCardExistenceOnField(field, id) {
        if (!field.hasCard(id)) {
            return err(`no card with id ${id}` + JSON.stringify(field));
        }
        return null;
    }

    attackCard(cardId, enemyId) {
        const playerField = this.getPlayerField();
        const opponentField = this.getOpponentField();
        const pErr = this.checkCardExistenceOnField(playerField, cardId);
        const oErr = this.checkCardExistenceOnField(opponentField, enemyId);
        if (pErr) {
            return pErr;
        }
        if (oErr) {
            return oErr;
        }
        const pCard = playerField.getCard(cardId);
        const oCard = opponentField.getCard(enemyId);
        pCard.fight(oCard);
        playerField.removeDeadCards();
        opponentField.removeDeadCards();
    }

    attackPlayer(cardId) {
        const playerField = this.getPlayerField();
        const pErr = this.checkCardExistenceOnField(playerField, cardId);
        if (pErr) {
            return pErr;
        }
        const pCard = playerField.getCard(cardId);
        const op = this.getCurrentOpponent();
        op.hp -= pCard.damage;
    }

    getWinner() {
        console.log(this.botPlayer.hp)
        if (this.botPlayer.hp < 1) {
            return "Player";
        } else if (this.humanPlayer.hp < 1) {
            return "Bot";
        }
        return null
    }
}

const createBotPlayer = () => {
    const randomStat = () => Math.floor(1 + Math.random() * 10);
    const cards = [];
    for (let index = 0; index < HAND_SIZE; index++) {
        const card = new GameCard({
            id: BOT_ID_OFFSET + index,
            damage: randomStat(),
            hp: randomStat(),
            image: "http://localhost:3000/images/blank.png"
        });
        cards.push(card);
    }
    return new Player(cards)
}

const createUserPlayer = (user) => {
    return new Player(user.cards.map(card => new GameCard(card)));
}

class BotPlayer {
    constructor(gameState) {
        this.gameState = gameState;
    }

    hasCardsOnOwnBoard() {
        return this.gameState.botField.getCardList().length > 0;
    }

    hasCardsOnEnemyBoard() {
        return this.gameState.humanField.getCardList().length > 0;
    }

    hasCardsToPlay() {
        return this.gameState.botPlayer.getCardList().length > 0;
    }

    playCard() {
        const cardToPlay = this.gameState.botPlayer.getCardList()[0];
        this.gameState.playCard(cardToPlay.id);
        return `Play card (${cardToPlay.id}) Damage: (${cardToPlay.damage}) Hp: (${cardToPlay.hp})`
    }

    getStrongestCardOnField() {
        const availableCards = this.gameState.botField.getCardList(); 
        let strongestCard = availableCards[0];
        for (let index = 1; index < availableCards.length; index++) {
            const card = availableCards[index];
            if (card.damage > strongestCard.damage) {
                strongestCard = card;
            }
        }
        return strongestCard;
    }

    getTargetCardForAttack(cardForAttack) {
        const availableCards = this.gameState.humanField.getCardList();
        let bestTarget = availableCards[0];
        for (let index = 0; index < availableCards.length; index++) {
            const card = availableCards[index];
            if (card.damage > bestTarget.damage && cardForAttack.damage >= card.currentHp) {
                bestTarget = card;
            }
        }
        return bestTarget;
    }

    attack() {
        const cardForAttack = this.getStrongestCardOnField();
        if (this.hasCardsOnEnemyBoard()) {
            if (Math.random() < 0.90) {
                const target = this.getTargetCardForAttack(cardForAttack);
                this.gameState.attackCard(cardForAttack.id, target.id, true);
                return `Attack player's card (${target.id}) with (${cardForAttack.id}), Damage: (${cardForAttack.damage})`
            }
        }
        this.gameState.attackPlayer(cardForAttack.id)
        return `Attack player with card (${cardForAttack.id}), Damage: (${cardForAttack.damage})`;
    }
    
    doTurn() {
        if (this.hasCardsToPlay() && !this.hasCardsOnOwnBoard()) {
            return this.playCard();
        } else if (!this.hasCardsToPlay() && this.hasCardsOnOwnBoard()) {
            return this.attack();
        } 
        if (Math.random() < 0.5) {
            return this.playCard();
        } else {
            return this.attack();
        }
    }
}

export class Game {
    constructor(solidity) {
        this.solidity = solidity;
        this.user = solidity.getUser();
        this.gameState = new GameState({
            botPlayer: createBotPlayer(),
            humanPlayer: createUserPlayer(this.user),
        });
        this.lastMessage = "New Game!";
        this.bot = new BotPlayer(this.gameState);
    }

    botTurn() {
        this.gameState.nextTurn();
        const res = this.bot.doTurn();
        this.gameState.nextTurn();
        console.log(res);
        this.lastMessage = res;
        return res
    }

    playCard(cardId) {
        const err = this.gameState.playCard(cardId);
        if (err) {
            return err;
        }
        return this.botTurn()
    }

    attackCard(cardId, enemyId) {
        const err = this.gameState.attackCard(cardId, enemyId);
        if (err) {
            return err;
        }
        return this.botTurn()
    }

    attackPlayer(cardId) {
        const err = this.gameState.attackPlayer(cardId);
        if (err) {
            return err;
        }
        return this.botTurn()
    }

    pass() {
        return this.botTurn()
    }

    getBoardState() {
        const pCards = this.gameState.humanField.getCardList();
        const bCards = this.gameState.botField.getCardList();
        return new State.Board(pCards, bCards);
    }

    getPlayerState() {
        return new State.Player(this.gameState.humanPlayer.getCardList(), this.gameState.humanPlayer.hp);
    }

    getEnemyState() {
        return new State.Enemy(this.gameState.botPlayer.getCardList().length, this.gameState.botPlayer.hp);
    }

    getState() {
        const board = this.getBoardState();
        const player = this.getPlayerState();
        const enemy = this.getEnemyState();
        const winState = this.gameState.getWinner();
        const message = this.lastMessage
        return new State.GameState({
            board,
            player,
            enemy,
            winState,
            message,
        })
    }
}
