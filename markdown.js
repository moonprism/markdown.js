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
            .replace(/\\</g, "&lt;")
            .replace(/\\>/g, "&gt;")
            .replace(/\\([!\[\*\~`#])/g, '$1');
    };
    let code_parse = function (str) {
        return str.replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
    // lexing
    let token;
    let heading, br, li, code, blockquote, table, paragraph, space, none, html;
    while (_text) {
        if (heading = _text.match(/^(#{1,6})\s+(.*?)(?:\s*|{#(\S*)})(?:\n+|$)/)) {
            // heading lexing #{1,6}
            tokens.push({
                type: 'heading',
                level: heading[1].length,
                id: heading[3],
                text: heading[2]
            });
            _text = _text.substring(heading[0].length);
        } else if (br = _text.match(/^([*-]){3}(?:\n+|$)/)) {
            // break lexing ***, ---
            tokens.push({
                type: 'br',
                tag: br[1] === '*' ? 'br' : 'hr',
            });
            _text = _text.substring(br[0].length);
        } else if (li = _text.match(/^(\*|\-|(\d)\.)\s([\s\S]*?)(?:(?:\s*\n\s*){2,}|$)/)) {
            // list lexing * , - , 1. ,
            let list_text = li[0].replace(/\t/g, '    ');
            token = {
                type: 'list',
                list: [],
            };
            let items = [];
            let item_match_result;
            while (item_match_result = list_text.match(/^(\s*(\*|\-|(\d)\.)\s([\s\S]*?)(\n|$))(?:\s*(\*|\-|(\d)\.)\s*|\n|$)/)) {
                items.push(item_match_result[1]);
                list_text = list_text.substring(item_match_result[1].length);
            }
            let lv_info_stack = []; 
            let pop_info;
            for (let i=0; i<items.length; i++) {
                let item = items[i].match(/^(\s*)(\*|\-|(\d)\.)\s([\s\S]*?)$/);
                let level = item[1].length;
                let tag = (item[2] === '*' || item[2] === '-') ? 'ul' : 'ol';
                if (lv_info_stack.length === 0) {
                    lv_info_stack.push({
                        lv: level,
                        tag
                    });
                    token.list.push(
                        {type: 'list-open', tag},
                        {type: 'item-open'}
                    );
                } else {
                    let last_level_info = lv_info_stack[lv_info_stack.length-1];
                    if (level > last_level_info.lv) {
                        lv_info_stack.push({
                            lv: level,
                            tag
                        });
                        token.list.push(
                            {type: 'list-open', tag},
                            {type: 'item-open'}
                        );
                    } else if (level < last_level_info.lv) {
                        while(pop_info = lv_info_stack.pop()) {
                            if (pop_info.lv === level) {
                                lv_info_stack.push(pop_info);
                                break;
                            }
                            token.list.push(
                                {type: 'item-close'},
                                {type: 'list-close', tag: pop_info.tag},
                            );
                        }
                        token.list.push(
                            {type: 'item-close'},
                            {type: 'item-open'}
                        );
                    } else {
                        token.list.push(
                            {type: 'item-close'},
                            {type: 'item-open'}
                        );
                    }
                }
                token.list.push(
                    {type: 'item', text: item[4].trim()}
                );
            }
            // pop all lv_info from stack
            while (pop_info = lv_info_stack.pop()) {
                token.list.push(
                    {type: 'item-close'},
                    {type: 'list-close', tag: pop_info.tag}
                )
            }
            tokens.push(token);
            _text = _text.substring(li[0].length);
        } else if (code = _text.match(/^```(?:(\S+)|)\n([\s\S]*?)\n```/)) {
            // code lexing ``` ```
            tokens.push({
                type: 'code',
                lang: code[1],
                text: code[2]
            });
            _text = _text.substring(code[0].length);
        } else if (blockquote = _text.match(/^>(?:\s|\[(\S+?)\]\s)([\s\S]*?)(?:\n{2,}|$)/)) {
            // blockquote lexing >
            tokens.push({
                type: 'blockquote',
                class: blockquote[1],
                text: blockquote[2]
            });
            _text = _text.substring(blockquote[0].length);
        } else if (table = _text.match(/^\|(.+?)\|\n/)) {
            // table lexing | | |
            let ahead_table = _text.substring(table[0].length).match(/^\|([-:\|\s]+?)\|\n/);
            _text = _text.substring(table[0].length);
            if (ahead_table === null) {
                tokens.push({
                    type: 'p',
                    text: table[0],
                });
                continue;
            } else {
                token = {
                    type: "table",
                    header: table[1].split('|').map(function(item){return item.trim()}),
                    align: [],
                    cells: [],
                }
                // lexing align
                let align_slice = ahead_table[1].split('|');
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
                _text = _text.substring(ahead_table[0].length);
                // lexing cell
                while (ahead_table = _text.match(/^\|(.+?)\|(?:\n|$)/)) {
                    token.cells.push(ahead_table[1].split('|').map(function(item){return item.trim()}));
                    _text = _text.substring(ahead_table[0].length);
                }
                tokens.push(token);
            }
        } else if (html = _text.match(/^<(\S+?)[\s|>][\s\S]*?(?:<\/\S+>\s*|\n{2,}|$)/)) {
            // html block lexing <></>
            tokens.push({
                type: 'html',
                html: html[0],
                tag: html[1]
            })
            _text = _text.substring(html[0].length);
        } else if (paragraph = _text.match(/^.+/)) {
            // paragraph lexing
            token = {
                type: 'paragraph',
                text: paragraph[0]
            }
            let last_token = tokens.pop();
            if (last_token) {
                if (last_token.type === token.type) {
                    last_token.text += '\n' + token.text;
                    tokens.push(last_token)
                } else {
                    tokens.push(last_token, token)
                }
            } else {
                tokens.push(token)
            }
            _text = _text.substring(paragraph[0].length)
        } else if (space = _text.match(/^\n{2,}/)) {
            // space lexing
            tokens.push({
                type: 'space',
            })
            _text = _text.substring(space[0].length)
        } else if (none = _text.match(/^\s+/)){
            // none
            _text = _text.substring(none[0].length)
        }
        continue;
    }
    // parse
    while (token = tokens.shift()) {
        switch(token.type) {
            case 'heading':
                token.attributes = token.id === undefined ? '' : ' id="' + token.id + '"';
                _html += '<h' + token.level + token.attributes + '>' + inline_parse(token.text) + '</h' + token.level + '>';
                break;
            case 'br':
                _html += '<' + token.tag + '>';
                break;
            case 'paragraph':
                _html += '<p>' + inline_parse(token.text).replace(/\n/g, '<br>') + '</p>';
                break;
            case 'list':
                token.list.forEach(function(item) {
                    switch(item.type) {
                        case 'list-open':
                            _html += '<' + item.tag + '>';
                            break;
                        case 'list-close':
                            _html += '</' + item.tag + '>';
                            break;
                        case 'item-open':
                            _html += '<li>';
                            break;
                        case 'item-close':
                            _html += '</li>';
                            break;
                        case 'item':
                            _html += inline_parse(item.text).replace(/\n/g, '<br>');
                            break;
                    }
                });
                break;
            case 'code':
                token.attributes = token.lang === undefined ? '' : ' class="language-' + token.lang + '"';
                _html += '<pre><code' + token.attributes + '>' + code_parse(token.text) + '</code></pre>';
                break;
            case 'blockquote':
                token.attributes = token.class === undefined ? '' : ' class="' + token.class + '"';
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
            case 'html':
                _html += token.html;
                break;
        }
    }
    return _html;
}
module.exports = markdown;