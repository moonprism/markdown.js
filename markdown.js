// 一个简单markdown
function markdown(input){
    text = input.replace(/(\r\n|\n|\r)/g, "\n")
                .replace( /&/g, "&amp;" )
                .replace( /</g, "&lt;" )
                .replace( />/g, "&gt;" )
                .replace( /"/g, "&quot;" )
                .replace( /'/g, "&#39;" );
    var re = /([\s\S]+?)($|\n\s*\n|$)+/g, m ,_html = "";
    // 通用的行内元素正则
    var line_reg = function(str){
        return str.replace(/(?:^|[^!])\[(.*?)\]\((.*?)\)/g, '<a target="_blank" href="$2">$1</a>')
                    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
                    .replace(/\*(.+?)\*/g, '<i>$1</i>')
                    .replace(/`(.+?)`/g, '<code>$1</code>')
                    .replace(/~~(.+?)~~/g, '<s>$1</s>');
    };
    var code_lan,
        code_block_index = false;
    // 代码块格式化正则
    var code_reg = function(str){
        // 可以在这写一套关于某种语言的正则
        switch(code_lan){
            case 'c':
            //...
            break;
        }
        return str.replace(/\t/g, '    ')
                  .replace(/(\/\/.+)/, '<span class="note">$1</span>');
    }
    if ( ( m = /^(\s*\n)/.exec(text) ) != null ) {
        re.lastIndex = m[0].length;
    }
    // 开始循环每个块
    while ( ( m = re.exec(text) ) !== null ) {
        var block = m[1].split("\n");
        var to_str = "";
        for (var i = 0; i <= block.length - 1; i++) {
            var h, hr, li, bq, pre;
            // 块级元素正则
            if( code_block_index ){
                // 将该块也包含进代码块中
                _html += '\n';
                while( block[i] && (block[i].match(/^```(\s*)(?:\n|$)/) === null) ){
                    // 每行正则，还是拼成块再正则比较好？
                    _html += (code_reg(block[i])+'\n');
                    block[i] = '';
                    i++;
                }
                if (block[i] !== undefined) {
                    // 找到结束标志
                    code_block_index = false;
                    _html += '</pre></div>';
                }
                block[i] = '';
            } else if ( ( h = block[i].match( /^(#{1,6})\s*(.*?)\s*#*\s*(?:\n|$)/ ) ) !== null ) {
                // 解析<h>
                // 这里if将h作为一个新的块存在
                if (to_str!="") {
                    _html += "<p>"+to_str+"</p>";
                    to_str = "";
                }
                block[i] = '';
                _html += '<h'+h[1].length+'>'+line_reg(h[2])+'</h'+h[1].length+'>';
            } else if ( ( hr = block[i].match( /^(?:([\s\S]*?)\n)?[ \t]*([-_*])(?:[ \t]*\2){2,}[ \t]*(?:\n([\s\S]*))?$/ ) ) !== null ) {
                // 解析<hr>
                if (to_str!="") {
                    _html += "<p>"+to_str+"</p>";
                    to_str = "";
                }
                _html += hr[2] == '*' ? '<br>' : '<hr>';
                block[i] = '';
            } else if ( (li = block[i].match( /^(\*|\d\.)\s(.*?)\s*(?:\n|$)/ )) !== null ){
                // 解析<li>
                if (to_str!="") {
                    _html += "<p>"+to_str+"</p>";
                    to_str = "";
                }
                var tag = li[1]=='*' ? 'ul' : 'ol';
                _html += '<'+tag+'><li>'+line_reg(li[2])+'</li>';
                block[i] = '';
                var li_reg = new RegExp("^("+(li[1]=='*' ? "\\*" : "\\d\\.")+")\\s(.*?)\\s*(?:\\n|$)");
                // 这里将使所有li跳出这个块
                while( (li = li_reg.exec(block[++i])) !== null ){
                    li[2] = line_reg(li[2]);
                    _html += '<li>'+li[2]+'</li>';
                    block[i] = '';
                }
                i--;
                _html += block[i]+'</'+tag+'>';
                block[i] = '';
            } else if( (bq = block[i].match( /^&gt;\s(.*?)\s*(?:\n|$)/ )) !== null ) {
                // 解析引用
                if (to_str!="") {
                    _html += "<p>"+to_str+"</p>";
                    to_str = "";
                }
                // 将引用延续到该块结束
                _html += '<blockquote>'+line_reg(bq[1]);
                block[i] = '';
                while( i<=block.length - 1 ){
                    _html += line_reg(block[i]);
                    block[i] = '';
                    i++;
                }
                i--;
                _html += block[i]+'</blockquote>';
                block[i] = '';
            } else if( (pre = block[i].match( /^```(\S*)(?:\n|$)/ )) !== null ){
                // 解析代码块
                if (to_str!="") {
                    _html += "<p>"+to_str+"</p>";
                    to_str = "";
                }
                code_lan = pre[1]?pre[1]:'code';
                _html += '<div class="'+code_lan+'"><pre>';
                block[i] = '';
                // 将所有代码跳出这个块
                while( block[++i] && (block[i].match(/^```(\s*)(?:\n|$)/) === null) ){
                    _html += (code_reg(block[i])+'\n');
                    block[i] = '';
                }
                if (block[i] === undefined) {
                    // 没有找到结束标志
                    code_block_index = true;
                } else {
                    _html += '</pre></div>';
                }
                block[i] = '';
            }
            // 行内元素正则
            if (block[i]!='') {
                to_str += (line_reg(block[i])).replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" >');
            }            
        }
        if(to_str!='') {
            _html += "<p>"+to_str+"</p>";
        }
    }
    return _html;
}