# Markdown.js

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/moonprism/markdown.js/ci?style=flat-square)](https://github.com/moonprism/markdown.js/actions?query=workflow%3Aci) [![GitHub file gzip size in bytes](http://img.badgesize.io/moonprism/markdown.js/master/dist/markdown.min.js?compression=gzip&style=flat-square&color=blue)](https://github.com/moonprism/markdown.js/blob/master/dist/markdown.min.js)

[![NPM](https://nodei.co/npm/moonprism-markdown.png)](https://nodei.co/npm/moonprism-markdown/)

a simple markdown parser for JavaScript.

* ⚡ [example](https://moonprism.github.io/markdown.js/)

## Syntax

* \``inline code`\`
* \**italicize*\*
* \*\***bold**\*\*
* \[link text](address)
* \!\[image alt text](src)
* \*\*\* or ---
* \## heading {#heading-id}
* \~\~~~strikethrough~~\~\~
* \ escape inline
* list

```md
1. Step 1
    * Item a
    * Item b
        1. b1
    * Item c
2. Step 2
    1. first

- [x] task1
- [ ] task2
```

* blockquotes

```md
> blockquote
next line

>[success] blockquote
> > next block
```

* code

\```go
```go
package main

func main() {
    println('mdzz')
}
```
\```

* table

```md
 left align | right align | center 
 :------| ------: | :------: 
 AND | 0 | 1 
 0 | 0 | 0 
 1 | 0 | 1 
```
* html

```html
<svg width="99" height="99">
  <circle cx="50" cy="50" r="40" stroke="black" stroke-width="2" fill="#d89cf6"/>
</svg>
```

## Install

```shell
npm install moonprism-markdown --save
```

## Usage

```js
import markdown from 'moonprism-markdown'
let html = markdown('# hello world')
```

or download [markdown.min.js](https://moonprism.github.io/markdown.js/markdown.min.js), and import file in your page.

```html
<script type="text/javascript" src="./markdown.min.js"></script>
<script type="text/javascript">
    var html = markdown('# hello world')
</script>
```

## Config

```js
markdown('# hello world', {
    debug: true,
    imageCDN: 'https://cdn.xx/',
    linkTargetBlank: true,
    lineParse: function(str) {return str},
    codeParse: function(str) {return str}
})
```