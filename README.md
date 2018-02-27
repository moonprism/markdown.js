# markdown.js

简单小巧的解析markdown语法的js工具

支持语法：

* \`代码\`
* \*斜体\*
* \*\*加粗\*\*
* \[链接\]\(链接地址\)
* \!\[说明\]\(图片地址\)
* \#\# 标题
* \* 无序列表
* 1\. 有序列表
* \转义

```
​```语言
代码块
​```
```

配置：

markdown.js第五行：
```js
var img_cdn = "";  // 写上自己的图床前缀
```

使用：

```js
var HTML = markdown(markdown);
```

[demo](http://md.moonprism.cc/)

