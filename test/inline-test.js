const assert = require('assert');

const md = require('../markdown')
md.imageCDN = 'http://test.cdn/'

describe('code', () => {
    it('base', () => {
        assert.strictEqual(md.parse('`cc`'), '<p><code class="_c">cc</code></p>');
    });
})

describe('italicize', () => {
    it('base', () => {
        assert.strictEqual(md.parse('*cc*'), '<p><i>cc</i></p>');
    });
})

describe('bold', () => {
    it('base', () => {
        assert.strictEqual(md.parse('**cc**'), '<p><b>cc</b></p>');
    });
})

describe('link', () => {
    it('base', () => {
        assert.strictEqual(md.parse('[text](http://address)'), '<p><a target="_blank" href="http://address">text</a></p>');
    });
    it('> code', () => {
        assert.strictEqual(md.parse('[text `code`](address)'), '<p><a target="_blank" href="address">text <code class="_c">code</code></a></p>');
    });
})

describe('image', () => {
    it('base', () => {
        assert.strictEqual(md.parse('![text](http://address)'), '<p><img alt="text" src="http://address" ></p>');
    });
    it('cdn', () => {
        assert.strictEqual(md.parse('![text](address)'), '<p><img alt="text" src="'+md.imageCDN+'address" ></p>');
    });
})

describe('break', () => {
    it('***', () => {
        assert.strictEqual(md.parse('***'), '<br>');
    });
    it('---', () => {
        assert.strictEqual(md.parse('---'), '<hr>');
    });
})

describe('heading', () => {
    it('h1', () => {
        assert.strictEqual(md.parse('# hh'), '<h1>hh</h1>');
    });
    it('h2', () => {
        assert.strictEqual(md.parse('## hh'), '<h2>hh</h2>');
    });
    it('h3', () => {
        assert.strictEqual(md.parse('### hh'), '<h3>hh</h3>');
    });
    it('> bold', () => {
        assert.strictEqual(md.parse('### hh**h**'), '<h3>hh<b>h</b></h3>');
    });
})

describe('break', () => {
    it('***', () => {
        assert.strictEqual(md.parse('***'), '<br>');
    });
    it('---', () => {
        assert.strictEqual(md.parse('---'), '<hr>');
    });
})