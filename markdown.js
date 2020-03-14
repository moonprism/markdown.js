function markdown(src, img_cdn = '') {
    let _text = src.replace(/(\r\n|\r)/g, "\n");
    let _html = '';
    let tokens = [];
    let inline_parse = function (str) {
        return str.replace(/([^\\]|^)!\[(.*?)\]\((http.*?)\)/g, '$1<img alt="$2" src="$3" >')
            .replace(/([^\\]|^)!\[(.*?)\]\((.*?)\)/g, '$1<img alt="$2" src="' + img_cdn + '$3" >')
            .replace(/([^\\]|^)\[(.*?)\]\((#.*?)\)/g, '$1<a href="$3">$2</a>')
            .replace(/([^\\]|^)\[(.*?)\]\((.*?)\)/g, '$1<a target="_blank" href="$3">$2</a>')
            .replace(/([^\\]|^)\*\*(.+?)\*\*/g, '$1<b>$2</b>')
            .replace(/([^\\]|^)\*(.+?)\*/g, '$1<i>$2</i>')
            .replace(/([^\\]|^)~~(.+?)~~/g, '$1<s>$2</s>')
            .replace(/([^\\]|^)`(.+?)`/g, function (match, prefix, code) {
                return prefix + '<code>' + code_parse(code) + '</code>'
            })
            .replace(/\\([!\[\*\~`#])/g, '$1');
    };
    let code_parse = function (str) {
        return str.replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
    let h, br, li, code, blockquote, table, p, s, n;
    while (_text) {
        if (h = _text.match(/^(#{1,6})\s+(.*?)(?:\s*|{#(\S*)})(?:\n+|$)/)) {
            // heading
            tokens.push({
                type: 'h',
                level: h[1].length,
                attributes: h[3] === undefined ? '' : ' id="' + h[3] + '"',
                text: h[2]
            });
            _text = _text.substring(h[0].length);
        } else if (br = _text.match(/^([*-]){3}(?:\n+|$)/)) {
            // break
            tokens.push({
                type: 'br',
                tag: br[1] === '*' ? 'br' : 'hr',
            });
            _text = _text.substring(br[0].length);
        } else if (li = _text.match(/^(\*|(\d)\.)\s([\s\S]*?)(?:\n{2,}|$)/)) {
            // list
            let text = li[0].replace(/\t/g, '    ');
            let item, list_item = [];
            while (item = text.match(/^(\s*(\*|(\d)\.)\s([\s\S]*?)(\n|$))(?:\s*(\*|(\d)\.)\s*|\n|$)/)) {
                list_item.push(item[1]);
                text = text.substring(item[1].length);
            }
            let token = {
                type: 'li',
                tag: li[1] === '*' ? 'ul' : 'ol',
                list: [],
            };
            let list_level_stack = [];
            for (let i=0; i<list_item.length; i++) {
                let item = list_item[i].match(/^(\s*)(\*|(\d)\.)\s([\s\S]*?)$/);
                let prefix_space_lv = item[1].length;
                let tag = item[2] === '*' ? 'ul' : 'ol';
                let prefix_tag = '';
                if (list_level_stack.length === 0) {
                    list_level_stack.push({
                        lv: prefix_space_lv,
                        tag
                    })
                    prefix_tag = '<li>';
                } else {
                    let last_level_info = list_level_stack[list_level_stack.length-1];
                    if (prefix_space_lv > last_level_info.lv) {
                        list_level_stack.push({
                            lv: prefix_space_lv,
                            tag
                        });
                        prefix_tag = '<' + tag + '><li>';
                    } else if (prefix_space_lv < last_level_info.lv) {
                        prefix_tag = '</li>';
                        while(pop_info = list_level_stack.pop()) {
                            if (pop_info.lv === prefix_space_lv) {
                                list_level_stack.push(pop_info);
                                break;
                            }
                            prefix_tag += '</' + pop_info.tag + '>';
                        }
                        prefix_tag += '</li><li>';
                    } else {
                        prefix_tag += '</li><li>';
                    }
                }
                token.list.push(prefix_tag + inline_parse(item[4].trim()));
            }
            token.list.push('</li>');
            tokens.push(token);
            _text = _text.substring(li[0].length);
        } else if (code = _text.match(/^```(\S*)\n([\s\S]+?)\n```(?:\n|$)/)) {
            // code
            tokens.push({
                type: 'code',
                lang: code[1],
                text: code[2],
                attributes: code[1] === '' ? '' : ' class="language-' + code[1] + '"'
            });
            _text = _text.substring(code[0].length);
        } else if (blockquote = _text.match(/^>(?:\s|\[(\S+?)\]\s)([\s\S]*?)(?:\n{2,}|$)/)) {
            // blockquote
            tokens.push({
                type: 'blockquote',
                attributes: blockquote[1] === undefined ? '' : ' class="' + blockquote[1] + '"',
                text: blockquote[2]
            });
            _text = _text.substring(blockquote[0].length);
        } else if (table = _text.match(/^\|(.+?)\|\n/)) {
            // table
            let ahead_align = _text.substring(table[0].length).match(/^\|([-:\|\s]+?)\|\n/);
            _text = _text.substring(table[0].length);
            if (ahead_align === null) {
                tokens.push({
                    type: 'p',
                    text: table[0],
                });
                continue;
            } else {
                let token = {
                    type: "table",
                    header: table[1].split('|').map(function(item){return item.trim()}),
                    align: [],
                    cells: [],
                }
                let align_slice = ahead_align[1].split('|');
                for (let i = 0; i < align_slice.length; i++) {
                    let align_text = align_slice[i].trim();
                    let align_left_char = align_text.substring(0, 1);
                    let align_right_char = align_text.substring(align_text.length - 1);
                    if (align_left_char == ':' && align_right_char == ':') {
                        token.align.push('center');
                    } else if (align_left_char == ':') {
                        token.align.push('left');
                    } else if (align_right_char == ':') {
                        token.align.push('right');
                    } else {
                        token.align.push('');
                    }
                }
                _text = _text.substring(ahead_align[0].length);
                let table_cell;
                while (table_cell = _text.match(/^\|(.+?)\|(?:\n|$)/)) {
                    token.cells.push(table_cell[1].split('|').map(function(item){return item.trim()}));
                    _text = _text.substring(table_cell[0].length);
                }
                tokens.push(token);
            }
        } else if (p = _text.match(/^.+/)) {
            // paragraph
            let token = {
                type: 'p',
                text: p[0]
            }
            let last_token = tokens.pop();
            if (last_token) {
                if (last_token.type === 'p') {
                    last_token.text += ('\n' + token.text);
                    tokens.push(last_token)
                } else {
                    tokens.push(last_token, token)
                }
            } else {
                tokens.push(token)
            }
            _text = _text.substring(p[0].length)
        } else if (s = _text.match(/^\n{2,}/)) {
            // space
            tokens.push({
                type: 's',
            })
            _text = _text.substring(s[0].length)
        } else if (n = _text.match(/^\s+/)){
            // none
            _text = _text.substring(n[0].length)
        }
        continue;
    }
    let token;
    while (token = tokens.shift()) {
        switch(token.type) {
            case 'h':
                _html += '<h' + token.level + token.attributes + '>' + inline_parse(token.text) + '</h' + token.level + '>';
                break;
            case 'br':
                _html += '<' + token.tag + '>';
                break;
            case 'p':
                _html += '<p>' + inline_parse(token.text) + '</p>';
                break;
            case 'li':
                _html += '<' + token.tag + '>' + token.list.join('') + '</' + token.tag + '>';
                break;
            case 'code':
                _html += '<pre><code' + token.attributes + '>' + code_parse(token.text) + '</code></pre>';
                break;
            case 'blockquote':
                _html += '<blockquote' + token.attributes + '>' + inline_parse(token.text.replace(/\n/g, '<br>')) + '</blockquote>';
                break;
            case 'table':
                let thead = '<thead><tr>';
                for (let i=0; i<token.header.length; i++) {
                    thead += '<th' + (token.align[i] ? ' align="' + token.align[i] + '"' : '') + '>' + inline_parse(token.header[i]) + '</th>';
                }
                thead += '</tr></thead>';
                let tbody = '<tbody>';
                for (let i=0; i<token.cells.length; i++) {
                    tbody += "<tr>";
                    for (let j=0; j < token.cells[i].length; j++) {
                        tbody += '<td' + (token.align[j] ? ' align="' + token.align[j] + '"' : '') + '>' + inline_parse(token.cells[i][j]) + '</td>';
                    }
                    tbody += "</tr>";
                }
                tbody += '</tbody>';
                _html += '<table>' + thead + tbody + '</table>';
                break;
        }
    }
    return _html;
}
module.exports = markdown;