import {assert} from 'chai'
import {Token} from "./index.mjs";

describe('Test token', () => {
    it('should test', function () {
        const img = "./test.jpg"
        const hp = 10;
        const dmg = 5;
        const token = new Token({img, hp, dmg})
        assert.equal(token.toUrl(), "./test.jpg|10|5")
        assert.equal(token.toUrl(), Token.fromUrl(token.toUrl()).toUrl())
        assert.equal(Token.fromUrl(token.toUrl()).dmg, dmg)
        assert.equal(Token.fromUrl(token.toUrl()).hp, hp)
        assert.equal(Token.fromUrl(token.toUrl()).img, img)
    });
})
