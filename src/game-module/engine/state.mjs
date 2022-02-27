export class GameCard {
    constructor(id, hp, currentHp, damage) {
        this.id = id;
        this.hp = hp;
        this.currentHp = currentHp
        this.damage = damage;
    }
    
    fromCard(card) {
        return new GameCard(card.id, card.hp, card.hp, card.damage);
    }
}

export class Board {
    constructor(playerCards, enemyCards) {
        this.playerCards = playerCards;
        this.enemyCards = enemyCards;
    }
}

export class Hand {
    constructor(cards) {
        this.cards = cards;
    }
}

export class Player {
    constructor(cards, currentHp) {
        this.hand = new Hand(cards);
        this.currentHp = currentHp
    }
}

export class Enemy {
    constructor(cardsInHand, currentHp) {
        this.cardsInHand = cardsInHand
        this.currentHp = currentHp
    }
}

export class GameState {
    constructor({board, player, enemy, winState, message}) {
        this.board = board;
        this.player = player;
        this.enemy = enemy;
        this.winState = winState;
        this.message = message
    }
}
