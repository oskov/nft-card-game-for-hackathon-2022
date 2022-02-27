class User {
    id = -1;
    score = 1;
    cards = [];
}

class Card {
    id = -1;
    hp = 1;
    damage = 1;
    image = '/images/blank.png';
    constructor(id, hp, damage, image) {
        this.id = id;
        this.hp = hp;
        this.damage = damage;
        this.image = image;
    }
}

export class Solidity {
    constructor(tokens) {
        this.tokens = tokens;
    }

    getUser() {
        const user = new User();
        for (let i = 0; i < this.tokens.tokens.length; i++) {
            const token = this.tokens.tokens[i];
            user.cards.push(new Card(i, token.hp, token.dmg, token.img));
        }
        return user;
    }
}
