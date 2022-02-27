import {assert} from 'chai'
import {Game} from './game.mjs'
import {Solidity} from './solidity.mjs'
import {Token} from "../../token/index.mjs";

describe('Game export tests', () => {
    it('should be exported', () => {
        assert.isOk(Game)
    })
})

describe('Game tests', () => {
    let game;
    before(() => {
        const tokens = [
            new Token({
                hp: 10,
                dmg: 3,
                img: './hotdog.png'
            }),
            new Token({
                hp: 1,
                dmg: 2,
                img: './cheeseburger.png'
            }),
        ]
        game = new Game(new Solidity(tokens));
    })

    it('should be correctly initialized', () => {
        const state = game.getState();
        assert.hasAllKeys(state, ['board', 'player', 'enemy', 'winState']);
        assert.hasAllKeys(state.board, ['playerCards', 'enemyCards']);
        assert.hasAllKeys(state.enemy, ['cardsInHand', 'currentHp']);
        assert.hasAllKeys(state.player, ['hand', 'currentHp']);
        assert.hasAllKeys(state.player.hand, ['cards']);
        assert.isNotEmpty(state.player.hand.cards);
        assert.hasAllKeys(state.player.hand.cards[0], ['id', 'hp', 'currentHp', 'damage', 'image']);
        assert.isEmpty(state.board.playerCards);
        assert.isEmpty(state.board.enemyCards);
    })

    it('should play card correctly', () => {
        let state = game.getState();
        const firstCard = state.player.hand.cards[0];
        const prevHandSize = state.player.hand.cards.length;
        
        game.playCard(firstCard.id)
        state = game.getState();
        assert.isNotEmpty(state.board.playerCards)
        const currentHandSize = state.player.hand.cards.length; 
        assert.equal(prevHandSize - 1, currentHandSize);
    })
})
