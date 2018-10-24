/* markdown.js | github >> https://github.com/kicoer/markdown.js
 * 简单小巧
 */
function markdown(input){
    let img_cdn = "";
    let text = input.replace(/(\r\n|\n|\r)/g, "\n")
                .replace( /&/g, "&amp;" )
                .replace( /</g, "&lt;" )
                .replace( />/g, "&gt;" )
                .replace( /"/g, "&quot;" )
                .replace( /'/g, "&#39;" );
    let re = /([\s\S]+?)($|\n\s*\n|$)+/g, m ,_html = "";
    // 行级元素正则
    let line_reg = function(str){
        return str.replace(/\\`/g, '&copyk;')
                    .replace(/\\\*/g, '&copyi;')
                    .replace(/\\~/g, '&copyc;')
                    .replace(/\\\[/g, '&copye;')
                    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="'+img_cdn+'$2" >')
                    .replace(/\[(.*?)\]\((#.*?)\)/g, '<a href="$2">$1</a>')
                    .replace(/\[(.*?)\]\((.*?)\)/g, '<a target="_blank" href="$2">$1</a>')
                    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
                    .replace(/\*(.+?)\*/g, '<i>$1</i>')
                    .replace(/`(.+?)`/g, '<code class="_c">$1</code>')
                    .replace(/~~(.+?)~~/g, '<s>$1</s>')
                    .replace(/&copyk;/g, '`')
                    .replace(/&copyi;/g, '*')
                    .replace(/&copyc;/g, '~')
                    .replace(/&copye;/g, '[');
    };
    let code_lan,
        code_block_index = false;
    // 代码块格式化
    let code_reg = function(str){
        switch(code_lan){
            case 'c':
            break;
        }
        return str.replace(/\t/g, '    ')
                  .replace(/(\/\/.+)/, '<span class="note">$1</span>');
    }
    if ( ( m = /^(\s*\n)/.exec(text) ) != null ) {
        re.lastIndex = m[0].length;
    }
    // 块级元素正则
    while ( ( m = re.exec(text) ) !== null ) {
        let block = m[1].split("\n");
        let to_str = "";
        for (let i = 0; i <= block.length - 1; i++) {
            let h, hr, li, bq, pre;
            if( code_block_index ){
                // 代码块标志检测
                _html += '\n';
                while( block[i] && (block[i].match(/^```(\s*)(?:\n|$)/) === null) ) {
                    _html += (code_reg(block[i])+'\n');
                    block[i] = '';
                    i++;
                }
                if (block[i] !== undefined) {
                    code_block_index = false;
                    _html += '</code></pre>';
                }
                block[i] = '';
            } else if ( ( h = block[i].match( /^(#{1,6})\s*(.*?)\s*#*\s*(?:\n|$)/ ) ) !== null ) {
                // 标题
                if (to_str!="") {
                    _html += "<p>"+to_str+"</p>";
                    to_str = "";
                }
                block[i] = '';
                let h_name = line_reg(h[2]);
                _html += '<h'+h[1].length+' id="'+h_name+'">'+h_name+'</h'+h[1].length+'>';
            } else if ( ( hr = block[i].match( /^(?:([\s\S]*?)\n)?[ \t]*([-_*])(?:[ \t]*\2){2,}[ \t]*(?:\n([\s\S]*))?$/ ) ) !== null ) {
                // 分隔
                if (to_str!="") {
                    _html += "<p>"+to_str+"</p>";
                    to_str = "";
                }
                _html += hr[2] == '*' ? '<br>' : '<hr>';
                block[i] = '';
            } else if ( ( li = block[i].match( /^(\*|\d\.)\s(.*?)\s*(?:\n|$)/ )) !== null ) {
                // 列表
                if (to_str!="") {
                    _html += "<p>"+to_str+"</p>";
                    to_str = "";
                }
                let tag = li[1]=='*' ? 'ul' : 'ol';
                _html += '<'+tag+'><li>'+line_reg(li[2])+'</li>';
                block[i] = '';
                let li_reg = new RegExp("^("+(li[1]=='*' ? "\\*" : "\\d\\.")+")\\s(.*?)\\s*(?:\\n|$)");
                while( (li = li_reg.exec(block[++i])) !== null ){
                    li[2] = line_reg(li[2]);
                    _html += '<li>'+li[2]+'</li>';
                    block[i] = '';
                }
                i--;
                _html += block[i]+'</'+tag+'>';
                block[i] = '';
            } else if ( (bq = block[i].match( /^&gt;\s(.*?)\s*(?:\n|$)/ )) !== null ) {
                // 引用
                if (to_str!="") {
                    _html += "<p>"+to_str+"</p>";
                    to_str = "";
                }
                _html += '<blockquote>'+line_reg(bq[1]);
                block[i] = '';
                while( i<=block.length - 1 ){
                    _html += line_reg(block[i])+'<br>';
                    block[i] = '';
                    i++;
                }
                i--;
                _html += block[i]+'</blockquote>';
                block[i] = '';
            } else if ( (pre = block[i].match( /^```(\S*)(?:\n|$)/ )) !== null ) {
                // 代码
                if (to_str!="") {
                    _html += "<p>"+to_str+"</p>";
                    to_str = "";
                }
                code_lan = pre[1]?pre[1]:'code';
                _html += '<pre><code class="'+code_lan+'">';
                block[i] = '';
                while( block[++i] && (block[i].match( /^```(\s*)(?:\n|$)/ ) === null) ) {
                    _html += (code_reg(block[i])+'\n');
                    block[i] = '';
                }
                if (block[i] === undefined) {
                    code_block_index = true;
                } else {
                    _html += '</code></pre>';
                }
                block[i] = '';
            } else if ( (pre = block[i].match(/^\|(.+?)\|$/)) !== null ) {
                /* +表格 */
                // 判断第二行
                let table_align_text, table_align;
                if ( block[i+1] && (table_align_text = block[i+1].match(/^\|([-:\|\s]+?)\|$/)) !== null ) {
                    // 判断对齐方向
                    table_align = table_align_text[1].split('|');
                    for (let tai = 0; tai < table_align.length; tai++) {
                        let ta_text = table_align[tai].replace(/^\s+|\s+$/g,"");
                        if (ta_text.substring(0,1) == ':' && ta_text.substring(ta_text.length-1) == ':') {
                            table_align[tai] = 'style="text-align: center;"';
                        } else if (ta_text.substring(0,1) == ':') {
                            table_align[tai] = 'style="text-align: left;"';
                        } else if (ta_text.substring(ta_text.length-1) == ':') {
                            table_align[tai] = 'style="text-align: right;"';
                        } else {
                            table_align[tai] = '';
                        }
                    }
                    // 解析表头
                    _html += '<table><tr>';
                    let ths = pre[1].split('|');
                    for (let thi = 0; thi < ths.length; thi++) {
                        _html += '<th '+table_align[thi]+'>'+ths[thi]+'</th>';
                    }
                    _html += '</tr>';
                    // 解析表单内容
                    i++;
                    while( block[++i] && block[i] != '' ) {
                        // 确认可以解析该行
                        if ((pre = block[i].match(/^\|(.+?)\|$/)) !== null) {
                            _html += '<tr>';
                            let ths = pre[1].split('|');
                            for (let thi = 0; thi < ths.length; thi++) {
                                _html += '<td '+table_align[thi]+'>'+ths[thi]+'</td>';
                            }
                            _html += '</tr>';
                        }
                    }
                    _html += '</table>'
                    block[i] = '';
                }
            }
            // 单块
            if (block[i]!='') {              
                to_str += line_reg(block[i]);
            }            
        }
        if(to_str!='') {
            _html += "<p>"+to_str+"</p>";
        }
    }
    return _html;
}