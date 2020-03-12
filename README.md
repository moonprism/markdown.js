# markdown.js

[![NPM](https://nodei.co/npm/moonprism-markdown.png)](https://nodei.co/npm/moonprism-markdown/)

a simple markdown parser for JavaScript.

[example](https://moonprism.github.io/markdown.js/)

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
* code block
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
* html
```
<img src="https://avatars0.githubusercontent.com/u/15173284?s=120&v=4" style="border-radius: 50%">
```

## install

```shell
npm install moonprism-markdown --save
```

## usage

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