function markdown(text, config = {}) {
    text = text.replace(/(\r\n|\r)/g, '\n').replace(/\t/g, '  ');
    var tokens = [];

    const img_cdn = config.imageCDN ? config.imageCDN : '';
    const link_attr = config.linkTargetBlank ? ' target="_blank" rel="noopener"' : '';

    function parseCode (str) {
        return str
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/&lt;(\/?)em&gt;/g, '<$1em>')
    }

    function parseInline (str) {
        return str
            .replace(/\\\\/g, '🍕')
            .replace(/\\</g, "&lt;")
            .replace(/\\>/g, "&gt;")
            .replace(/([^\\]|^)(`+)([^`]+?)\2/g, (match, prefix, _, code) => {
                return prefix+'<code>'+parseCode(code)+'</code>'
            })
            .replace(/([^\\]|^)!\[([^<]*?)\]\(([^<]*?)\)/g, (match, prefix, alt, img) => {
                if (!img.match(/^(?:\/|http:|https:)/)) {
                    img = img_cdn + img
                }
                return prefix+'<img alt="'+alt+'" src="'+img+'">'
            })
            .replace(/([^\\]|^)\[(.*?)\]\((#[^<]*?)\)/g, '$1<a href="$3">$2</a>')
            .replace(/([^\\]|^)\[(.*?)\]\(([^<]*?)\)/g, '$1<a' + link_attr + ' href="$3">$2</a>')
            .replace(/([^\\]|^)(?:<|&lt;)([a-zA-Z]+:.*)(?:>|&gt;)/g, (match, prefix, href) => {
                if (href.indexOf('<em>') !== -1){
                    return match
                }
                return prefix+'<a '+link_attr+' href="'+href+'">'+href+'</a>'
            })
            .replace(/([^\\]|^)\*\*(.+?)\*\*/g, '$1<b>$2</b>')
            .replace(/([^\\]|^)\*(.+?)\*/g, '$1<i>$2</i>')
            .replace(/([^\\]|^)~~(.+?)~~/g, '$1<s>$2</s>')
            .replace(/\\([!\[\*\~``#])/g, '$1')
            .replace(/🍕/g, '\\')
    }

    function parseLists(str) {
        let re = str.match(/^( *)(\*|\-|\d+\.) .+(\n.+|\n\n  .+)*/)
        if (re) {
            let order = re[2] !== '*' && re[2] !== '-'
            let li = [];
            if (re[1] !== '') {
                li = re[0].split(new RegExp('(?:\n|^)'+re[1]+'(?:\\*|\\-|\\d+\\.) '))
            } else {
                li = re[0].split(/(?:^|\n)(?:\*|\-|\d+\.) /g)
            }
            li.shift()

            tokens.push({type: 'list-open', order})

            li.forEach(s => {
                tokens.push({type: 'list-item-open'})
                s = s.trim();
                if (s.startsWith('[ ]')) {
                    s = s.substr(3)
                    tokens.push({type: 'task', done: false})
                } else if (s.startsWith('[x]')) {
                    s = s.substr(3)
                    tokens.push({type: 'task', done: true})
                }
                if (s.indexOf('\n') != -1) {
                    if (s.indexOf('\n\n  ')) {} //todo
                    parse([parseHeading, parseLists, parseBlockCode, parseBlockquote, parseText, skipEmptyLines], s)
                } else {
                    tokens.push({type: 'text', value: s, br: false})
                }
                tokens.push({type: 'list-item-close'})
            })
            tokens.push({type: 'list-close', order})
            return re[0].length
        }
        return 0
    }

    function parseText(str) {
        let re = str.match(/^\s*(.+)(\n|$)/)
        if (re) {
            tokens.push({type:'text', value: re[1], br: true})
            return re[0].length
        }
        return 0
    }

    function parseHeading(str) {
        let re = str.match(/^(#{1,6})\s+(.*?)(?:\s*|\s*{#([a-zA-Z]\S*)})(?:\n+|$)/)
        if (re) {
            tokens.push({
                type: 'heading',
                level: re[1].length,
                id: re[3],
                text: re[2]
            });
            return re[0].length
        }
        return 0
    }

    function parseLineBreak(str) {
        let re = str.match(/^([*-]){3,}(?:\n+|$)/)
        if (re) {
            tokens.push({
                type: 'br',
                blank: re[1] === '*',
            });
            return re[0].length
        }
        return 0
    }

    function parseBlockCode(str) {
        let re = str.match(/^ *```(?:(\S+)|)\n([\s\S]*?)\n```/)
        if (re) {
            tokens.push({
                type: 'code',
                lang: re[1],
                text: re[2]
            });
            return re[0].length
        }
        return 0
    }

    function parseHTML(str) {
        let re = str.match(/^<([a-zA-Z\-]+)[\s|>][\s\S]*?(?:<\/\1>\s*|\n{2,}|$)/)
        if (re) {
            tokens.push({
                type: 'html',
                html: re[0],
                tag: re[1]
            })
            return re[0].length
        }
        return 0
    }

    function parseParagraph(str) {
        let re = str.match(/^.+(\n*)/)
        if (re) {
            let token = {
                type: 'paragraph',
                text: re[0].trim(),
                terminal: re[1].length > 1
            }
            let last_token = tokens.pop()
            if (last_token) {
                if (last_token.type === token.type && !last_token.terminal) {
                    token.text = last_token.text + '\n' + token.text
                    tokens.push(token)
                } else {
                    tokens.push(last_token, token)
                }
            } else {
                tokens.push(token)
            }
            return re[0].length
        }
        return 0
    }

    function parseBlockquote(str) {
        let re = str.match((/^(\s*)(?:>|&gt;)(?:\s|\[(\S+?)\]\s)([\s\S]*?)(?:\n{2,}|$)/))
        if (re) {
            tokens.push({type: 'blockquote-open', class: re[2]})
            let content = re[3].replace(/\n\s*(>|&gt;) */g, '\n')
            parse([parseHeading, parseLists, parseBlockquote, parseBlockCode, parseParagraph, skipEmptyLines], content)
            tokens.push({type: 'blockquote-close'})
            return re[0].length
        }
        return 0
    }

    function parseTable(str) {
        let re = str.match(/^\|*(.+\|[^\|^\n]+.*?)\|*\n\|*([-:\| ]+?\|[-:\| ]+?.*?)\|*\n(\|*(?:(?:.+\|[^\|^\n]+.*?)\|*(?:\n|$))*)/)
        if (re) {
            let token = {
                type: "table",
                header: re[1].split('|').map(item => item.trim()),
                align: [],
                cells: [],
            }
            // handle align
            re[2].split('|').forEach((item) => {
                let align_flag = item.trim();
                let left_align = align_flag.substring(0, 1) === ':';
                let right_align = align_flag.substring(align_flag.length - 1) === ':';
                if (left_align && right_align) {
                    token.align.push('center');
                } else if (left_align) {
                    token.align.push('left');
                } else if (right_align) {
                    token.align.push('right');
                } else {
                    token.align.push('');
                }
            })
            // lexing cell
            token.cells = re[3].trim().split('\n').map((item) => item.replace(/^\||\|$/g, '').split('|').map(i => i.trim()))
            tokens.push(token);
            return re[0].length
        }
        return 0
    }
    
    function skipEmptyLines (str) {
        let re = str.match(/^\s*\n/)
        if (re) {
            return re[0].length
        }
        return 0
    }

    function parse(funcList, str) {
        while (str) {
            let i = 0
            funcList.find(func => {
                i = func(str)
                return i !== 0
            })
            str = str.substring(i)
        }
    }

    parse([parseHeading, parseLineBreak, parseLists, parseBlockCode, parseBlockquote, parseTable, parseHTML, parseParagraph, skipEmptyLines], text)

    if (config.debug) {
        console.log({...tokens})
    }

    // parse
    let _html = ''
    while (token = tokens.shift()) {
        switch(token.type) {
            case 'heading':
                _html += '<h' + token.level + (token.id === undefined ? '' : ' id="' + token.id + '"') + '>' + parseInline(token.text) + '</h' + token.level + '>'
                break;
            case 'br':
                _html += '<' + (token.blank?'br':'hr') + ' />'
                break;
            case 'paragraph':
                _html += '<p>' + parseInline(token.text).replace(/\n/g, '<br />') + '</p>'
                break;
            case 'list-open':
                _html += '<' + (token.order?'ol':'ul') + '>'
                break;
            case 'list-close':
                _html += '</' + (token.order?'ol':'ul') + '>'
                break;
            case 'list-item-open':
                _html += '<li>'
                break;
            case 'list-item-close':
                _html += '</li>'
                break;
            case 'text':
                _html += parseInline(token.value);
                if (token.br && tokens.length > 0 && tokens[0].type === 'text') {
                    _html += '<br />'
                }
                break;
            case 'task':
                _html += '<input' + (token.done ? ' checked' : '') + ' disabled type="checkbox"></input>'
                break;
            case 'code':
                _html += '<pre><code' + (token.lang === undefined ? '' : ' class="language-' + token.lang + '"') + '>' + parseCode(token.text) + '</code></pre>'
                break;
            case 'blockquote-open':
                _html += '<blockquote' + (token.class === undefined ? '' : ' class="' + token.class + '"') + '>'
                break;
            case 'blockquote-close':
                _html += '</blockquote>'
                break;
            case 'table':
                let thead = '<thead><tr>';
                token.header.forEach((v, i) => {
                    thead += '<th' + (token.align[i] ? ' align="' + token.align[i] + '"' : '') + '>' + parseInline(v) + '</th>'
                })
                thead += '</tr></thead>'
                let tbody = '<tbody>'
                token.cells.forEach(v => {
                    tbody += "<tr>"
                    v.forEach((v2, i) => {
                        tbody += '<td' + (token.align[i] ? ' align="' + token.align[i] + '"' : '') + '>' + parseInline(v2) + '</td>'
                    })
                    tbody += "</tr>"
                })
                tbody += '</tbody>';
                _html += '<table>' + thead + tbody + '</table>'
                break;
            case 'html':
                _html += token.html
                break;
        }
    }
    return _html
}
module.exports = markdown
