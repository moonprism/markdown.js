const B = ($, p = {}) => {
  $ = $.replace(/(\r\n|\r)/g, `
`).replace(/\t/g, "  ");
  let u = "";
  function c(n) {
    p.debug && console.log(n), u += n;
  }
  const E = p.isOpenInNewTab ? ' target="_blank" rel="noopener"' : "";
  function m(n) {
    return n.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  const _ = ["🔮", "🧙", "🌟", "🃏"];
  function f(n) {
    return _.some((t) => n.includes(t));
  }
  function h(n) {
    return n.replace(/\\\\/g, "🌻-S").replace(/\\</g, "&lt;").replace(/\\>/g, "&gt;").replace(
      /(``*)\s*(.+?)\s*\1/g,
      (t, e, r) => `<code>${m(r)}</code>`
    ).replace(/([^\\]|^)!\[([^<>]*?)\]\(([^<>]*?)\)/g, (t, e, r, s) => {
      if (f(r) || f(s))
        return t;
      const o = p.imageCdnUrl && !s.match(/^(?:\/|https?)/) ? p.imageCdnUrl : "";
      return `${e}<img alt="${r}" src="${o}${s}">`;
    }).replace(/([^\\]|^)\[(.*?)\]\(([^<>]*?)\)/g, (t, e, r, s) => f(s) ? t : `${e}<a${E} href="${s}">${r}</a>`).replace(/([^\\]|^)(?:<|&lt;)(https?\S+?)(?:>|&gt;)/g, (t, e, r) => f(r) ? m(t) : `${e}<a${E} href="${r}">${r}</a>`).replace(/([^\\]|^)\*\*(.+?)\*\*/g, "$1<b>$2</b>").replace(/([^\\]|^)\*(.+?)\*/g, "$1<i>$2</i>").replace(/([^\\]|^)~~(.+?)~~/g, "$1<s>$2</s>").replace(/\\([!\[\*\~``#])/g, "$1").replace(/\🌻-S/g, "\\");
  }
  function d(n) {
    const t = n.match(/^( *)(\*|\-|\d+\.) .+(?:\n.+|\n\n  .+)*/);
    if (!t)
      return 0;
    const [e, r, s] = t, o = ["*", "-"].includes(s);
    let l = [];
    return r !== "" ? l = e.split(
      new RegExp(`(?:
|^)${r}(?:\\*|\\-|\\d+\\.) `)
    ) : l = e.split(/(?:^|\n)(?:\*|\-|\d+\.) /g), l.shift(), c(`<${o ? "ol" : "ul"}>`), l.forEach((a) => {
      c("<li>"), a = a.trim();
      const i = a.match(/^\[(\s|x)\]/);
      if (i) {
        a = a.substring(3);
        const [, g] = i;
        c(
          `<input disabled ${g === "x" ? "checked" : ""} type="checkbox"></input>`
        );
      }
      a.indexOf(`
`) != -1 ? x(
        [
          b,
          d,
          k,
          S,
          q,
          R
        ],
        a
      ) : c(h(a)), c("</li>");
    }), c(`</${o ? "ol" : "ul"}>`), e.length;
  }
  function q(n) {
    const t = n.match(/^\s*(.+)(\n|$)/);
    if (!t)
      return 0;
    const [e, r] = t;
    return c(h(r)), e.length;
  }
  function b(n) {
    const t = n.match(
      /^(#{1,6})\s+(.*?)(?:\n+|$)/
    );
    if (!t)
      return 0;
    const [e, r, s] = t;
    return c(`<h${r.length}>${h(s)}</h${r.length}>`), e.length;
  }
  function w(n) {
    const t = n.match(/^([*-]){3,}(?:\n+|$)/);
    if (!t)
      return 0;
    const [e, r] = t;
    return c(`<${r === "*" ? "br" : "hr"} />`), e.length;
  }
  function k(n) {
    const t = n.match(/^ *(``{2,})(?:(\S+)|)\n([\s\S]*?)\n\1/);
    if (!t)
      return 0;
    const [e, , r, s] = t;
    return c(
      `<pre><code${r === void 0 ? "" : ` class="language-'${r}"`}>${m(s)}</code></pre>`
    ), e.length;
  }
  function L(n) {
    const t = n.match(
      /^<([a-zA-Z\-]+)[\s|>][\s\S]*?(?:<\/\1>\s*|\n{2,}|$)/
    );
    if (!t)
      return 0;
    const [e, r] = t;
    return c(e), e.length;
  }
  function C(n) {
    const t = n.match(/^.+\n*/);
    if (!t)
      return 0;
    const [e] = t;
    return c(`<p>${h(e)}</p>`), e.length;
  }
  function S(n) {
    const t = n.match(
      /^(\s*)(?:>|&gt;)(?:\s|\[(\S+?)\]\s)([\s\S]*?)(?:\n{2,}|$)/
    );
    if (!t)
      return 0;
    const [e, , r, s] = t;
    return c(
      `<blockquote${r === void 0 ? "" : ` class="${r}"`}>`
    ), x(
      [
        b,
        d,
        S,
        k,
        C,
        R
      ],
      s.replace(/\n\s*(>|&gt;) */g, `
`)
    ), c("</blockquote>"), e.length;
  }
  function T(n) {
    const t = n.match(
      /^\|*(.+\|[^\|^\n]+.*?)\|*\n\|*([-:\| ]+?\|[-:\| ]+?.*?)\|*\n(\|*(?:(?:.+\|[^\|^\n]+.*?)\|*(?:\n|$))*)/
    );
    if (!t)
      return 0;
    const [e, r, s, o] = t;
    let l = [];
    return s.split("|").forEach((a) => {
      a = a.trim();
      const i = a.startsWith(":"), g = a.endsWith(":");
      i && g ? l.push("center") : g ? l.push("right") : l.push("left");
    }), c("<table><thead><tr>"), r.split("|").map((a) => a.trim()).forEach((a, i) => {
      c(`<th align="${l[i]}">${h(a)}</th>`);
    }), c("</tr></thead>"), o.trim().split(`
`).forEach((a) => {
      c("<tr>"), a.replace(/^\||\|$/g, "").split("|").forEach((i, g) => {
        c(`<td align="${l[g]}">${h(i)}</td>`);
      }), c("</tr>");
    }), c("</table>"), e.length;
  }
  function R(n) {
    const t = n.match(/^\s*\n/);
    return t ? t[0].length : 0;
  }
  function x(n, t) {
    for (; t; ) {
      let e = 0;
      n.find((r) => (e = r(t), e !== 0)), t = t.substring(e);
    }
  }
  return x(
    [
      b,
      w,
      d,
      k,
      S,
      T,
      C,
      L,
      R
    ],
    $
  ), u = u.replace(/(\s+)<\/p><p>/g, (n, t) => t.split(`
`).length === 2 ? " " : "</p><p>"), u = u.replace(/\s+<\/p>/g, "</p>"), u;
};
export {
  B as default
};
