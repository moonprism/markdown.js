/* markdown-js | github >> https://github.com/moonprism/markdown.js
 * 取消了注释现在连我自己都看不懂
 */
function markdown(input){
    var img_cdn = "";
    var text = input.replace(/(\r\n|\n|\r)/g, "\n")
                .replace( /&/g, "&amp;" )
                .replace( /</g, "&lt;" )
                .replace( />/g, "&gt;" )
                .replace( /"/g, "&quot;" )
                .replace( /'/g, "&#39;" );
    var re = /([\s\S]+?)($|\n\s*\n|$)+/g, m ,_html = "";
    // 行级元素正则
    var line_reg = function(str){
        return str.replace(/\\`/g, '&copyk;')
                    .replace(/\\\*/g, '&copyi;')
                    .replace(/\\~/g, '&copyc;')
                    .replace(/\\\[/g, '&copye;')
                    .replace(/(?:^|[^!])\[(.*?)\]\((.*?)\)/g, '<a target="_blank" href="$2">$1</a>')
                    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
                    .replace(/\*(.+?)\*/g, '<i>$1</i>')
                    .replace(/`(.+?)`/g, '<code class="_c">$1</code>')
                    .replace(/~~(.+?)~~/g, '<s>$1</s>')
                    .replace(/&copyk;/g, '`')
                    .replace(/&copyi;/g, '*')
                    .replace(/&copyc;/g, '~')
                    .replace(/&copye;/g, '[');
    };
    var code_lan,
        code_block_index = false;
    // 代码块格式化
    var code_reg = function(str){
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
        var block = m[1].split("\n");
        var to_str = "";
        for (var i = 0; i <= block.length - 1; i++) {
            var h, hr, li, bq, pre;
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
                _html += '<h'+h[1].length+'>'+line_reg(h[2])+'</h'+h[1].length+'>';
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
                var tag = li[1]=='*' ? 'ul' : 'ol';
                _html += '<'+tag+'><li>'+line_reg(li[2])+'</li>';
                block[i] = '';
                var li_reg = new RegExp("^("+(li[1]=='*' ? "\\*" : "\\d\\.")+")\\s(.*?)\\s*(?:\\n|$)");
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
            }
            /* +表格 */
            // 单块
            if (block[i]!='') {              
                to_str += (line_reg(block[i])).replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="'+img_cdn+'$2" >');
            }            
        }
        if(to_str!='') {
            _html += "<p>"+to_str+"</p>";
        }
    }
    return _html;
}