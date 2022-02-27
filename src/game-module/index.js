import { Game } from './engine/game.mjs'
import { Solidity } from './engine/solidity.mjs';

export * from './engine/state.mjs';
export * from './engine/solidity.mjs'

export const NewGame = (tokens) => {
    return new Game(new Solidity(tokens))
}
