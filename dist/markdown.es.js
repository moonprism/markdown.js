const L = ($, p = {}) => {
  $ = $.replace(/(\r\n|\r)/g, `
`).replace(/\t/g, "  ");
  let u = "";
  function a(n) {
    p.debug && console.log(n), u += n;
  }
  const S = p.isOpenInNewTab ? ' target="_blank" rel="noopener"' : "";
  function x(n) {
    return n.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/&lt;(\/?)em&gt;/g, "<$1em>");
  }
  function g(n) {
    return n.replace(/\\\\/g, "🔮-S").replace(/\\</g, "&lt;").replace(/\\>/g, "&gt;").replace(
      /(``*)\s*(.+?)\s*\1/g,
      (t, e, r) => `<code>${x(r)}</code>`
    ).replace(/([^\\]|^)!\[([^<]*?)\]\(([^<]*?)\)/g, (t, e, r, l) => {
      const h = p.imageCdnUrl && !l.match(/^(?:\/|http:|https:)/) ? p.imageCdnUrl : "";
      return `${e}<img alt="${r}" src="${h}${l}">`;
    }).replace(/([^\\]|^)\[(.*?)\]\((#[^<]*?)\)/g, '$1<a href="$3">$2</a>').replace(
      /([^\\]|^)\[(.*?)\]\(([^<]*?)\)/g,
      `$1<a${S} href="$3">$2</a>`
    ).replace(
      /([^\\]|^)(?:<|&lt;)([a-zA-Z]+:.*)(?:>|&gt;)/g,
      (t, e, r) => r.indexOf("<em>") !== -1 ? t : `${e}<a${S} href="${r}">${r}</a>`
    ).replace(/([^\\]|^)\*\*(.+?)\*\*/g, "$1<b>$2</b>").replace(/([^\\]|^)\*(.+?)\*/g, "$1<i>$2</i>").replace(/([^\\]|^)~~(.+?)~~/g, "$1<s>$2</s>").replace(/\\([!\[\*\~``#])/g, "$1").replace(/\🔮-S/g, "\\");
  }
  function m(n) {
    const t = n.match(/^( *)(\*|\-|\d+\.) .+(?:\n.+|\n\n  .+)*/);
    if (!t)
      return 0;
    const [e, r, l] = t, h = ["*", "-"].includes(l);
    let s = [];
    return r !== "" ? s = e.split(
      new RegExp(`(?:
|^)${r}(?:\\*|\\-|\\d+\\.) `)
    ) : s = e.split(/(?:^|\n)(?:\*|\-|\d+\.) /g), s.shift(), a(`<${h ? "ol" : "ul"}>`), s.forEach((c) => {
      a("<li>"), c = c.trim();
      const i = c.match(/^\[(\s|x)\]/);
      if (i) {
        c = c.substring(3);
        const [, o] = i;
        a(
          `<input disabled ${o === "x" ? "checked" : ""} type="checkbox"></input>`
        );
      }
      c.indexOf(`
`) != -1 ? R(
        [
          f,
          m,
          d,
          b,
          C,
          k
        ],
        c
      ) : a(g(c)), a("</li>");
    }), a(`</${h ? "ol" : "ul"}>`), e.length;
  }
  function C(n) {
    const t = n.match(/^\s*(.+)(\n|$)/);
    if (!t)
      return 0;
    const [e, r] = t;
    return a(g(r)), e.length;
  }
  function f(n) {
    const t = n.match(
      /^(#{1,6})\s+(.*?)(?:\s*|\s*{#([a-zA-Z]\S*)})(?:\n+|$)/
    );
    if (!t)
      return 0;
    const [e, r, l, h] = t;
    return a(`<h${r.length}>${g(l)}</h${r.length}>`), e.length;
  }
  function _(n) {
    const t = n.match(/^([*-]){3,}(?:\n+|$)/);
    if (!t)
      return 0;
    const [e, r] = t;
    return a(`<${r === "*" ? "br" : "hr"} />`), e.length;
  }
  function d(n) {
    const t = n.match(/^ *(``{2,})(?:(\S+)|)\n([\s\S]*?)\n\1/);
    if (!t)
      return 0;
    const [e, , r, l] = t;
    return a(
      `<pre><code${r === void 0 ? "" : ` class="language-'${r}"`}>${x(l)}</code></pre>`
    ), e.length;
  }
  function q(n) {
    const t = n.match(
      /^<([a-zA-Z\-]+)[\s|>][\s\S]*?(?:<\/\1>\s*|\n{2,}|$)/
    );
    if (!t)
      return 0;
    const [e, r] = t;
    return a(e), e.length;
  }
  function E(n) {
    const t = n.match(/^.+\n*/);
    if (!t)
      return 0;
    const [e] = t;
    return a(`<p>${g(e)}</p>`), e.length;
  }
  function b(n) {
    const t = n.match(
      /^(\s*)(?:>|&gt;)(?:\s|\[(\S+?)\]\s)([\s\S]*?)(?:\n{2,}|$)/
    );
    if (!t)
      return 0;
    const [e, , r, l] = t;
    return a(
      `<blockquote${r === void 0 ? "" : ` class="${r}"`}>`
    ), R(
      [
        f,
        m,
        b,
        d,
        E,
        k
      ],
      l.replace(/\n\s*(>|&gt;) */g, `
`)
    ), a("</blockquote>"), e.length;
  }
  function w(n) {
    const t = n.match(
      /^\|*(.+\|[^\|^\n]+.*?)\|*\n\|*([-:\| ]+?\|[-:\| ]+?.*?)\|*\n(\|*(?:(?:.+\|[^\|^\n]+.*?)\|*(?:\n|$))*)/
    );
    if (!t)
      return 0;
    const [e, r, l, h] = t;
    let s = [];
    return l.split("|").forEach((c) => {
      c = c.trim();
      const i = c.startsWith(":"), o = c.endsWith(":");
      i && o ? s.push("center") : o ? s.push("right") : s.push("left");
    }), a("<table><thead><tr>"), r.split("|").map((c) => c.trim()).forEach((c, i) => {
      a(`<th align="${s[i]}">${g(c)}</th>`);
    }), a("</tr></thead>"), h.trim().split(`
`).forEach((c) => {
      a("<tr>"), c.replace(/^\||\|$/g, "").split("|").forEach((i, o) => {
        a(`<td align="${s[o]}">${g(i)}</td>`);
      }), a("</tr>");
    }), a("</table>"), e.length;
  }
  function k(n) {
    const t = n.match(/^\s*\n/);
    return t ? t[0].length : 0;
  }
  function R(n, t) {
    for (; t; ) {
      let e = 0;
      n.find((r) => (e = r(t), e !== 0)), t = t.substring(e);
    }
  }
  return R(
    [
      f,
      _,
      m,
      d,
      b,
      w,
      E,
      q,
      k
    ],
    $
  ), u = u.replace(/(\s+)<\/p><p>/g, (n, t) => t.split(`
`).length === 2 ? " " : "</p><p>"), u = u.replace(/\s+<\/p>/g, "</p>"), u;
};
export {
  L as default
};
