a simple markdown parser. [demo](https://moonprism.github.io/markdown.js/)

## Install

```shell
npm i moonprism-markdown
```

## Use

```js
import markdown from "moonprism-markdown";
let html = markdown("# hello world");
```

## Case

`````
### A third-level heading
> Text that is a quote

Here is a simple footnote[^1].

A footnote can also have multiple lines[^2].

~~This was mistaken text~~

*233***All this text is important All bold and italic**

Use `git status` to list all new or modified files that haven't yet been committed.

This site was built using [GitHub Pages](https://pages.github.com/).

[^1]: My reference.
[^2]: To add line breaks within a footnote, prefix new lines with 2 spaces.
  This is a second line.

````
```
Look! You can see my backticks.
```
````

<details><summary>Alerts</summary>

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

</details>

<details><summary>Tables</summary>

| Left-aligned | Center-aligned | Right-aligned |
| :---         |     :---:      |          ---: |
| git status   | git status     | git status    |
| git diff     | git diff       | git diff      |

</details>

<details><summary>Lists</summary>

11. Lists
    - George Washington
    * John Adams
12. Nested Lists
    1. First list item
       - First nested list item
13. Task Lists
    - [x] #739
    - [ ] https://github.com/octo-org/octo-repo/issues/740

</details>

<details><summary>Images</summary>

![an Octocat smiling and raising a tentacle.](https://myoctocat.com/assets/images/base-octocat.svg)

</details>

<details><summary>Complex</summary>

- A
  >>> D
  >>
  >
  E
  - F
    ```
    G
    
    H
    ```
- B
  > - I
  >   - JK
- C

</details>
`````