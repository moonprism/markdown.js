const assert = require('assert');

import markdown from '../markdown';

describe('code', () => {
    it('base', () => {
        assert.strictEqual(markdown('`cc`'), '<p><code>cc</code></p>');
    });
    it('> link', () => {
        assert.strictEqual(markdown('`[xx](http://xx)`'), '<p><code><a href="http://xx">xx</a></code></p>');
    });
})

describe('italicize', () => {
    it('base', () => {
        assert.strictEqual(markdown('*cc*'), '<p><i>cc</i></p>');
    });
})

describe('bold', () => {
    it('base', () => {
        assert.strictEqual(markdown('**cc**'), '<p><b>cc</b></p>');
    });
})

describe('link', () => {
    it('base', () => {
        assert.strictEqual(markdown('[text](http://address)', {linkTargetBlank: true}), '<p><a target="_blank" href="http://address">text</a></p>');
    });
    it('> code', () => {
        assert.strictEqual(markdown('[text `code`](address)'), '<p><a href="address">text <code>code</code></a></p>');
    });
})

describe('image', () => {
    it('base', () => {
        assert.strictEqual(markdown('![text](http://address)'), '<p><img alt="text" src="http://address" ></p>');
    });
    it('cdn', () => {
        assert.strictEqual(markdown('![text](address)', {imageCDN: 'http://test.cdn/'}), '<p><img alt="text" src="http://test.cdn/address" ></p>');
    });
})

describe('break', () => {
    it('***', () => {
        assert.strictEqual(markdown('***'), '<br>');
    });
    it('---', () => {
        assert.strictEqual(markdown('---'), '<hr>');
    });
})

// ...
describe('heading', () => {
    it('h1', () => {
        assert.strictEqual(markdown('# hh'), '<h1>hh</h1>');
    });
    it('h2', () => {
        assert.strictEqual(markdown('## hh {#h2}'), '<h2 id="h2">hh</h2>');
    });
    it('h3 > custom inline parse', () => {
        assert.strictEqual(markdown('## hhh:zap: {#h2}', {inlineParse: function(str){return str.replace(/:zap:/g, '⚡️')}}), '<h2 id="h2">hhh⚡️</h2>');
    });
})

describe('heading', () => {
    it('h1', () => {
        assert.strictEqual(markdown('# hh'), '<h1>hh</h1>');
    });
    it('h2', () => {
        assert.strictEqual(markdown('## hh'), '<h2>hh</h2>');
    });
    it('h3', () => {
        assert.strictEqual(markdown('### hh'), '<h3>hh</h3>');
    });
    it('> bold', () => {
        assert.strictEqual(markdown('### hh**h**'), '<h3>hh<b>h</b></h3>');
    });
})

describe('break', () => {
    it('***', () => {
        assert.strictEqual(markdown('***'), '<br>');
    });
    it('---', () => {
        assert.strictEqual(markdown('---'), '<hr>');
    });
})