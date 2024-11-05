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
function markdown(md, conf = {}) {
  let html = ''; // 最终解析文本
  function buildHtml(str) {
    html += str;
  }

  const link_attrs = conf.isOpenInNewTab ? ' target="_blank" rel="noopener"' : '';

  // 转义code中的特殊字符
  function escapeCode(str) {
    return str.replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  }

  // 查询关键字的标记符号(带有以下符号的某些行内元素不会被解析
  // 预见4
  // 水晶球 (🔮) - U+1F52E
  // 占卜者 (🧙) - U+1F9D9
  // 星星 (🌟) - U+1F31F
  // 塔罗牌 (🃏) - U+1F0CF
  const foreseeSigns = ['🔮', '🧙', '🌟', '🃏'];
  function foresee(str) {
    return foreseeSigns.some((sign) => str.includes(sign));
  }

  const inlineSlashChars = ['\\', '!', '[', '*', '~', '#', '`', '^'];
  const inlineSlashMark = '🌻-✦';

  // 解析所有行内元素
  function parseInline(str) {
    inlineSlashChars.forEach((char) => {
      str = str.replaceAll(`\\${char}`, `${inlineSlashMark}${char.charCodeAt(0)}`);
    });
    str = str
      .replaceAll('\\<', '&lt;')
      .replaceAll('\\>', '&gt;')
      .replace(/(``*)\s*(.+?)\s*\1/g, (_, _backticks, s) => `<code>${escapeCode(s)}</code>`)
      .replace(/!\[([^<>]*?)\]\(([^<>]*?)\)/g, (match, alt, src) => {
        if (foresee(alt) || foresee(src)) {
          return match;
        }
        const cdn = conf.imageCdnUrl && !src.match(/^(?:\/|https?)/) ? conf.imageCdnUrl : '';
        return `<img alt="${alt}" src="${cdn}${src}">`;
      })
      .replace(/\[(.*?)\]\(([^<>]*?)\)/g, (match, s, href) => {
        if (foresee(href)) {
          return match;
        }
        return `<a${link_attrs} href="${href}">${s}</a>`;
      })
      .replace(/<(https?\S+?)>/g, (_, href) => {
        if (foresee(href)) {
          return `&lt;${href}&gt;`;
        }
        return `<a${link_attrs} href="${href}">${href}</a>`;
      })
      .replace(/\[\^(\d+)\]/g, '<sup><a href="#fn-$1">$1</a></sup>')
      .replace(/(\*{2})+?([^\*].*?)\1/g, '<strong>$2</strong>')
      .replace(/(\*)(.+?)\1/g, '<em>$2</em>')
      .replace(/(~~)(.+?)\1/g, '<del>$2</del>');

    inlineSlashChars.forEach((char) => {
      str = str.replaceAll(`${inlineSlashMark}${char.charCodeAt(0)}`, char);
    });
    return str;
  }

  function parseLists(str) {
    const matchResult = str.match(
      // 不允许跨多行匹配，需要空白字符前缀
      /^( *)(\*|\-|\d+\.) .+(?:\n(\*|\-|\d+\.| ).+)*(?:\n|$)/
    );
    if (!matchResult) {
      return 0;
    }
    const [match, leadingSpace, signChar] = matchResult;
    const isUnOrder = ['*', '-'].includes(signChar);

    /**
     * @type {string[]}
     */
    let lis = match.split(
      new RegExp(`(?:\n|^)${leadingSpace ? leadingSpace : ''}(?:\\*|\\-|\\d+\\.) `)
    );
    lis.shift();

    buildHtml(`<${isUnOrder ? 'ul' : `ol start="${signChar.substring(0, signChar.length - 1)}"`}>`);
    lis.forEach((s) => {
      buildHtml('<li>');
      s = s.trim();

      const taskMatchResult = s.match(/^\[(\s|x)\] /);
      if (taskMatchResult) {
        s = s.substring(4);
        const [, taskSign] = taskMatchResult;
        buildHtml(`<input disabled ${taskSign === 'x' ? 'checked' : ''} type="checkbox"></input> `);
      }

      const nextLineMatch = s.match(/\n( +)/);
      if (nextLineMatch) {
        // 以下一行的起始空格数来对齐后面的行
        const [, spaces] = nextLineMatch;
        s = s.replaceAll('\n' + spaces, '\n');
        mark([parseHeading, parseLists, parseCode, parseBlockquote, parseText, skipEmptyLines], s);
      } else {
        buildHtml(parseInline(s));
      }
      buildHtml('</li>');
    });
    buildHtml(`</${isUnOrder ? 'ul' : 'ol'}>`);
    return match.length;
  }

  function parseText(str) {
    const matchResult = str.match(/^ *(.+)(\n|$)/);
    if (!matchResult) {
      return 0;
    }
    const [match, text, end] = matchResult;
    // TODO 相邻的text行才加空格
    buildHtml(`${parseInline(text)}${end === '\n' ? ' ' : ''}`);
    return match.length;
  }

  function parseHeading(str) {
    const matchResult = str.match(/^(#{1,6}) +(.*?)(?:\n|$)/);
    if (!matchResult) {
      return 0;
    }
    const [match, signs, text] = matchResult;
    buildHtml(`<h${signs.length}>${parseInline(text)}</h${signs.length}>`);
    return match.length;
  }

  function parseLineBreak(str) {
    const matchResult = str.match(/^([*-] ?){3,}(?:\n+|$)/);
    if (!matchResult) {
      return 0;
    }
    const [match, sign] = matchResult;
    buildHtml('<hr>');
    return match.length;
  }

  function parseCode(str) {
    const matchResult = str.match(/^ *(``{2,})(?:(\S+)|)\n([\s\S]*?)\n *\1(?:\n|$)/);
    if (!matchResult) {
      return 0;
    }
    const [match, , lang, text] = matchResult;
    buildHtml(
      `<pre><code${
        lang === undefined ? '>' : `${foresee(lang) ? `>${lang}\n` : ` class="language-${lang}">`}`
      }${escapeCode(text)}</code></pre>`
    );
    return match.length;
  }

  function parseHTML(str) {
    const matchResult = str.match(/^<([a-zA-Z\-]+).*?>([\s\S]*?)<\/\1>(?:\n|$)/);
    if (!matchResult) {
      return 0;
    }
    const [match, tag, text] = matchResult;
    if (tag === 'details') {
      buildHtml('<details>');
      mark(
        [
          parseHeading,
          parseLineBreak,
          parseLists,
          parseCode,
          parseBlockquote,
          parseTable,
          parseHTML,
          parseParagraph,
          skipEmptyLines
        ],
        text
      );
      buildHtml('</details>');
    } else {
      buildHtml(match);
    }
    return match.length;
  }

  function parseBlockquote(str) {
    const matchResult = str.match(/^ *> ?( *(.*)(?:\n *> *.*)*)(?:\n|$)/);
    if (!matchResult) {
      return 0;
    }
    const [match, text, firstLine] = matchResult;
    const alertMatchResult = firstLine.match(/^\[\!([A-Z]+)\] *$/);
    let alertLen = 0;
    // github 的 > [!TIP] 语法
    if (alertMatchResult) {
      const [alertMatch, alertName] = alertMatchResult;
      buildHtml(
        `<div class="admonition alert-${alertName.toLowerCase()}"><p class="admonition-title">${alertName}</p>`
      );
      alertLen = alertMatch.length;
    } else {
      buildHtml(`<blockquote>`);
    }
    mark(
      [parseHeading, parseLists, parseBlockquote, parseCode, parseParagraph, skipEmptyLines],
      text.substring(alertLen).replace(/\n *> ?/g, '\n')
    );
    if (alertMatchResult) {
      buildHtml('</div>');
    } else {
      buildHtml('</blockquote>');
    }
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
    align.split('|').forEach((s) => {
      s = s.trim();
      if (s.startsWith(':') && s.endsWith(':')) {
        aligns.push('center');
      } else if (s.endsWith(':')) {
        aligns.push('right');
      } else {
        aligns.push('left');
      }
    });
    buildHtml('<table><thead><tr>');
    header.split('|').forEach((v, i) => {
      buildHtml(`<th align="${aligns[i]}">${parseInline(v.trim())}</th>`);
    });
    buildHtml('</tr></thead>');
    cells
      .trim()
      .split('\n')
      .forEach((tr) => {
        buildHtml('<tr>');
        tr.replace(/^\||\|$/g, '')
          .split('|')
          .forEach((td, i) => {
            buildHtml(`<td align="${aligns[i]}">${parseInline(td)}</td>`);
          });
        buildHtml('</tr>');
      });
    buildHtml('</table>');
    return match.length;
  }

  let footnoteHtml = '';
  function parseFootnote(str) {
    const matchResult = str.match(/^ *\[\^(\d+)\]:([\s\S]+?)(?:\n{2}|\n(\[\^\d+\]\:)|$)/);
    if (!matchResult) {
      return 0;
    }
    const [match, fnId, text, nextFootNote] = matchResult;
    footnoteHtml += `<li id="fn-${fnId}"><p>${parseInline(
      text
    )}<a href="#fn-${fnId}">↩︎</a></p></li>`;
    if (nextFootNote) {
      return match.length - nextFootNote.length;
    }
    return match.length;
  }

  // parseParaGraph or parseText + skipEmptyLines must match all string
  function parseParagraph(str) {
    const matchResult = str.match(/^ *(.+\n*) */);
    if (!matchResult) {
      return 0;
    }
    const [match, text] = matchResult;
    if (text.trim() === '') {
      return 0;
    }
    buildHtml(`<p>${parseInline(text)}</p>`);
    return match.length;
  }

  function skipEmptyLines(str) {
    const matchResult = str.match(/^\s*(\n|$)/);
    if (!matchResult) {
      return 0;
    }
    return matchResult[0].length;
  }

  // 执行解析函数列表，直到文本终结
  function mark(funcList, str) {
    while (str) {
      let i = 0;
      // 顺序解析块级元素，当找到一个与之匹配后 continue
      funcList.some((func) => {
        i = func(str);
        if (conf.debug && i) {
          console.log(func.name, i);
          console.log(
            `%c${str.substring(0, i)}%c${str.substring(i).substring(0, 300)}`,
            'background: #ddd',
            ''
          );
        }
        return i !== 0;
      });
      if (i === 0) {
        throw new Error('Cannot catch');
      }
      str = str.substring(i);
    }
  }

  mark(
    [
      parseHeading,
      parseFootnote,
      parseLineBreak,
      parseLists,
      parseCode,
      parseBlockquote,
      parseTable,
      parseHTML,
      parseParagraph,
      skipEmptyLines
    ],
    md
  );

  // 合并相邻段落，虽然效率差，但比之前`look back`少很多代码呀
  html = html.replace(/(\s+)<\/p><p>/g, (_, blanks) => {
    if (blanks.split('\n').length === 2) {
      return ' ';
    }
    return '</p><p>';
  });
  html = html.replace(/\s+<\/p>/g, '</p>');

  if (footnoteHtml) {
    html += `<ol>${footnoteHtml}</ol>`;
  }

  return html;
}
export default markdown;
