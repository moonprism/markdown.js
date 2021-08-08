# Markdown.js

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/moonprism/markdown.js/ci?style=flat-square)](https://github.com/moonprism/markdown.js/actions?query=workflow%3Aci) [![GitHub file gzip size in bytes](http://img.badgesize.io/moonprism/markdown.js/master/dist/markdown.min.js?compression=gzip&style=flat-square&color=blue)](https://github.com/moonprism/markdown.js/blob/master/dist/markdown.min.js)

[![NPM](https://nodei.co/npm/moonprism-markdown.png)](https://nodei.co/npm/moonprism-markdown/)

a simple markdown parser for JavaScript. :star: [demo](https://moonprism.github.io/markdown.js/)

## Syntax

* Span Elements

```md
auto link: <http://example.com/>
[This link](http://example.net/) has no title attribute.
![Alt text](/path/to/img.jpg)
*italicize*
`inline code`
**bold**
~~strikethrough~~
```

* Headers

```md
# h1 {#heading-id}
## h2
### h3
```

* Lists

````md
1. Step 1
    * requirements
```sh
pip3 install --user
```
    * build
        1. make link
> blockquote, hh
        2. make build
    * delete
2. Step 2
    1. first

- [x] task1
- [ ] task2
````

* Blockquotes

````md
> blockquote
next line

>[success] blockquote
>> next block
>> * list 1
>> * list 2
>>   ```
code in list
```
>
> next line
````

* Code

````go
```go
package main

func main() {
    println('mdzz')
}
```
````

* Table

```md
 left align | right align | center 
 :------| ------: | :------: 
 AND | 0 | 1 
 0 | 0 | 0 
 1 | 0 | 1 
```
* HTML

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
    linkTargetBlank: true
})
```
