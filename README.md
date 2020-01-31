# markdown.js

[![NPM](https://nodei.co/npm/moonprism-markdown.png)](https://nodei.co/npm/moonprism-markdown/)

a simple Markdown parser for JavaScript.

## syntax

* \`code\`
* \*italicize text\*
* \*\*bold text\*\*
* \[link text\]\(link address\)
* \!\[alt text\]\(image src\)
* \*\*\* & \-\-\- break line
* \#\# heading
* \* unordered list
* 1\. ordered list
* \escape
* \>[success] blockquotes
* code

```
​```go
package main

func main() {
    println('mdzz')
}
​```
```

* table

```
| left align | right align | center |
| :------| ------: | :------: |
| AND | 0 | 1 |
| 0 | 0 | 0 |
| 1 | 0 | 1 |
```

## install

```shell
$npm i moonprism-markdown
```

## usage

```js
import Markdown from 'moonprism-markdown'
Markdown.imageCDN = ''
let html = Markdown.parse('# hello world');
```