# Markdown.js

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/moonprism/markdown.js/ci?style=flat-square)](https://github.com/moonprism/markdown.js/actions?query=workflow%3Aci)
[![GitHub file size in bytes](https://img.shields.io/github/size/moonprism/markdown.js/dist/markdown.min.js?style=flat-square)](https://github.com/moonprism/markdown.js/blob/master/dist/markdown.min.js)

[![NPM](https://nodei.co/npm/moonprism-markdown.png)](https://nodei.co/npm/moonprism-markdown/)

a simple markdown parser for JavaScript.

* ⚡ [example](https://moonprism.github.io/markdown.js/)

## Syntax

* \`inline code\`
* \*italicize\*
* \*\*bold\*\*
* \[link text]\(link address)
* \!\[alt text]\(image src)
* \*\*\* or ---
* \## heading {#heading-id}
* \ escape inline
* list

```md
1. Step 1
    * Item a
    * Item b
        1. b1
    * Item c
2. Step 2
    1. firse
```
* blockquotes

```md
> blockquote
next line

>[success] blockquote
```
* code

```md
​```go
package main

func main() {
    println('mdzz')
}
​```
```
* table

```md
| left align | right align | center |
| :------| ------: | :------: |
| AND | 0 | 1 |
| 0 | 0 | 0 |
| 1 | 0 | 1 |
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

or download [markdown.min.js](https://moonprism.github.io/markdown.js/markdown.min.js)

```html
<script type="text/javascript" src="./markdown.min.js"></script>
<script type="text/javascript">
    var html = markdown('# hello world')
</script>
```