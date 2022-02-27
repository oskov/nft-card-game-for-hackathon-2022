const SEPARATOR = "|"

export class Token {
    constructor({img, hp, dmg}) {
        this.hp = hp;
        this.dmg = dmg;
        this.img = img;
    }

    toUrl() {
        return [this.img, this.hp, this.dmg].join(SEPARATOR)
    }

    static fromUrl(url) {
        const [img, hp, dmg] = url.split(SEPARATOR)
        return new Token({hp: Number(hp), dmg: Number(dmg), img})
    }
}
