# markdown.js

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
* \> blockquotes
* code

```
​```php
<?php
    // comment
    echo "mdzz";
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

## usage

```js
$('md').innerHTML = markdown('# hello world');
```

## demo

[md.moonprism.cc](http://md.moonprism.cc/)

