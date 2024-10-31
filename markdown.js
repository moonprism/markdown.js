/**
 * @typedef {Object} Config
 * @property {string} imageCdnUrl - 图片CDN地址
 * @property {boolean} isOpenInNewTab - 是否在新标签中打开链接
 * @property {boolean} debug - 是否启用调试模式
 */

/**
 *
 * @param {string} md 要解析的markdown文本
 * @param {Config} conf -配置对象
 * @returns
 */
const markdown = (md, conf = {}) => {
  md = md.replace(/(\r\n|\r)/g, "\n").replace(/\t/g, "  ");

  // 最终解析文本
  let html = "";
  function buildHtml(str) {
    if (conf.debug) {
      console.log(str);
    }
    html += str;
  }

  const link_attribute = conf.isOpenInNewTab
    ? ' target="_blank" rel="noopener"'
    : "";

  // 转义code中的特殊字符
  function escapeCode(str) {
    return str
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // 查询结果关键字的标记符号(为了节省大小提取字段都没校验
  // 预见4
  // 水晶球 (🔮) - U+1F52E
  // 占卜者 (🧙) - U+1F9D9
  // 星星 (🌟) - U+1F31F
  // 塔罗牌 (🃏) - U+1F0CF
  const foreseeSigns = ["🔮", "🧙", "🌟", "🃏"];
  function foresee(str) {
    return foreseeSigns.some((sign) => str.includes(sign));
  }

  // 解析所有行内元素
  function parseInline(str) {
    return str
      .replace(/\\\\/g, "🌻-S")
      .replace(/\\</g, "&lt;")
      .replace(/\\>/g, "&gt;")
      .replace(
        /(``*)\s*(.+?)\s*\1/g,
        (_, _backticks, s) => `<code>${escapeCode(s)}</code>`
      )
      .replace(/([^\\]|^)!\[([^<>]*?)\]\(([^<>]*?)\)/g, (match, prefix, alt, src) => {
        if (foresee(alt) || foresee(src)) {
          return match;
        }
        const cdn =
          conf.imageCdnUrl && !src.match(/^(?:\/|https?)/)
            ? conf.imageCdnUrl
            : "";
        return `${prefix}<img alt="${alt}" src="${cdn}${src}">`;
      })
      .replace(/([^\\]|^)\[(.*?)\]\(([^<>]*?)\)/g, (match, prefix, s, href) => {
        if (foresee(href)) {
          return match;
        }
        return `${prefix}<a${link_attribute} href="${href}">${s}</a>`;
      })
      .replace(/([^\\]|^)(?:<|&lt;)(https?\S+?)(?:>|&gt;)/g, (match, prefix, href) => {
        if (foresee(href)) {
          return match;
        }
        return `${prefix}<a${link_attribute} href="${href}">${href}</a>`;
      })
      .replace(/([^\\]|^)\*\*(.+?)\*\*/g, "$1<b>$2</b>")
      .replace(/([^\\]|^)\*(.+?)\*/g, "$1<i>$2</i>")
      .replace(/([^\\]|^)~~(.+?)~~/g, "$1<s>$2</s>")
      .replace(/\\([!\[\*\~``#])/g, "$1")
      .replace(/\🌻-S/g, "\\");
  }

  function parseLists(str) {
    const matchResult = str.match(/^( *)(\*|\-|\d+\.) .+(?:\n.+|\n\n  .+)*/);
    if (!matchResult) {
      return 0;
    }
    const [match, leadingSpace, signChar] = matchResult;
    const hasOrder = ["*", "-"].includes(signChar);
    /**
     * @type {string[]}
     */
    let li = [];
    if (leadingSpace !== "") {
      li = match.split(
        new RegExp(`(?:\n|^)${leadingSpace}(?:\\*|\\-|\\d+\\.) `)
      );
    } else {
      li = match.split(/(?:^|\n)(?:\*|\-|\d+\.) /g);
    }
    li.shift();

    buildHtml(`<${hasOrder ? "ol" : "ul"}>`);

    li.forEach((s) => {
      buildHtml("<li>");
      s = s.trim();
      const taskMatchResult = s.match(/^\[(\s|x)\]/);
      if (taskMatchResult) {
        s = s.substring(3);
        const [, taskSign] = taskMatchResult;
        buildHtml(
          `<input disabled ${
            taskSign === "x" ? "checked" : ""
          } type="checkbox"></input>`
        );
      }
      if (s.indexOf("\n") != -1) {
        mark(
          [
            parseHeading,
            parseLists,
            parseBlockCode,
            parseBlockquote,
            parseText,
            skipEmptyLines,
          ],
          s
        );
      } else {
        buildHtml(parseInline(s));
      }
      buildHtml("</li>");
    });
    buildHtml(`</${hasOrder ? "ol" : "ul"}>`);
    return match.length;
  }

  function parseText(str) {
    const matchResult = str.match(/^\s*(.+)(\n|$)/);
    if (!matchResult) {
      return 0;
    }
    const [match, text] = matchResult;
    buildHtml(parseInline(text));
    return match.length;
  }

  function parseHeading(str) {
    const matchResult = str.match(
      /^(#{1,6})\s+(.*?)(?:\n+|$)/
    );
    if (!matchResult) {
      return 0;
    }
    const [match, signs, text] = matchResult;
    buildHtml(`<h${signs.length}>${parseInline(text)}</h${signs.length}>`);
    return match.length;
  }

  function parseLineBreak(str) {
    const matchResult = str.match(/^([*-]){3,}(?:\n+|$)/);
    if (!matchResult) {
      return 0;
    }
    const [match, sign] = matchResult;
    buildHtml(`<${sign === "*" ? "br" : "hr"} />`);
    return match.length;
  }

  function parseBlockCode(str) {
    const matchResult = str.match(/^ *(``{2,})(?:(\S+)|)\n([\s\S]*?)\n\1/);
    if (!matchResult) {
      return 0;
    }
    const [match, , lang, text] = matchResult;
    buildHtml(
      `<pre><code${
        lang === undefined ? "" : ` class="language-'${lang}"`
      }>${escapeCode(text)}</code></pre>`
    );
    return match.length;
  }

  function parseHTML(str) {
    const matchResult = str.match(
      /^<([a-zA-Z\-]+)[\s|>][\s\S]*?(?:<\/\1>\s*|\n{2,}|$)/
    );
    if (!matchResult) {
      return 0;
    }
    const [match, tag] = matchResult;
    buildHtml(match);
    return match.length;
  }

  function parseParagraph(str) {
    const matchResult = str.match(/^.+\n*/);
    if (!matchResult) {
      return 0;
    }
    const [match] = matchResult;
    buildHtml(`<p>${parseInline(match)}</p>`);
    return match.length;
  }

  function parseBlockquote(str) {
    const matchResult = str.match(
      /^(\s*)(?:>|&gt;)(?:\s|\[(\S+?)\]\s)([\s\S]*?)(?:\n{2,}|$)/
    );
    if (!matchResult) {
      return 0;
    }
    const [match, , className, content] = matchResult;
    buildHtml(
      `<blockquote${className === undefined ? "" : ` class="${className}"`}>`
    );
    mark(
      [
        parseHeading,
        parseLists,
        parseBlockquote,
        parseBlockCode,
        parseParagraph,
        skipEmptyLines,
      ],
      content.replace(/\n\s*(>|&gt;) */g, "\n")
    );
    buildHtml("</blockquote>");
    return match.length;
  }

  function parseTable(str) {
    const matchResult = str.match(
      /^\|*(.+\|[^\|^\n]+.*?)\|*\n\|*([-:\| ]+?\|[-:\| ]+?.*?)\|*\n(\|*(?:(?:.+\|[^\|^\n]+.*?)\|*(?:\n|$))*)/
    );
    if (!matchResult) {
      return 0;
    }
    const [match, header, align, cells] = matchResult;

    /**
     * 表格的对齐信息
     * @type {('left'|'center'|right)[]}
     */
    let aligns = [];
    align.split("|").forEach((s) => {
      s = s.trim();
      const leftSign = s.startsWith(":");
      const rightSign = s.endsWith(":");
      if (leftSign && rightSign) {
        aligns.push("center");
      } else if (rightSign) {
        aligns.push("right");
      } else {
        aligns.push("left");
      }
    });

    buildHtml("<table><thead><tr>");
    header
      .split("|")
      .map((item) => item.trim())
      .forEach((v, i) => {
        buildHtml(`<th align="${aligns[i]}">${parseInline(v)}</th>`);
      });
    buildHtml("</tr></thead>");
    cells
      .trim()
      .split("\n")
      .forEach((tr) => {
        buildHtml("<tr>");
        tr.replace(/^\||\|$/g, "")
          .split("|")
          .forEach((td, i) => {
            buildHtml(`<td align="${aligns[i]}">${parseInline(td)}</td>`);
          });
        buildHtml("</tr>");
      });
    buildHtml("</table>");
    return match.length;
  }

  function skipEmptyLines(str) {
    const matchResult = str.match(/^\s*\n/);
    if (!matchResult) {
      return 0;
    }
    return matchResult[0].length;
  }

  function mark(funcList, str) {
    while (str) {
      let i = 0;
      funcList.find((func) => {
        i = func(str);
        return i !== 0;
      });
      str = str.substring(i);
    }
  }

  mark(
    [
      parseHeading,
      parseLineBreak,
      parseLists,
      parseBlockCode,
      parseBlockquote,
      parseTable,
      parseParagraph,
      parseHTML,
      skipEmptyLines,
    ],
    md
  );

  // 合并相邻段落，虽然效率差，但比之前`look back`少很多代码呀
  html = html.replace(/(\s+)<\/p><p>/g, (_, blanks) => {
    if (blanks.split("\n").length === 2) {
      return " ";
    }
    return "</p><p>";
  });
  html = html.replace(/\s+<\/p>/g, "</p>");

  return html;
};
export default markdown;
