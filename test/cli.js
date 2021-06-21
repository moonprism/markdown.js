const util = require('util')
const exec = util.promisify(require('child_process').exec)
const fs = require('fs')
const highlight = require('cli-highlight').highlight
const beautify = require('js-beautify').html

const markdown = require('../markdown.js')
const md = './test.md'
const tmp = '/tmp/test.html'

const render = () => {
    fs.readFile(md, 'utf8' , async (err, data) => {
        if (err) throw err
        let html = markdown(data)
        fs.writeFile(tmp, html, 'utf8', err => {})
        html = beautify(html)
        //let lynx_res = await exec("lynx -stdin -dump < "+tmp)
        //let tidy_res = await exec("tidy -xml -indent --indent-spaces 2 -quiet --tidy-mark no "+tmp)

        console.clear()
        console.log('=========== html ===========')
        console.log(highlight(html, {language: 'html', ignoreIllegals: true}))

        //console.log('\n======== simple view =======')
        //console.log(lynx_res.stdout)
    })
}

const run = async () => {
    let res
    res = await exec("tmux -V | awk '{print $2}{print 3.2}' | sort -V | head -n 1")
    if (res.stdout.trim() != '3.2') {
        throw 'tmux < 3.2'
    }
    res = await exec("echo $TERM_PROGRAM")
    if (res.stdout.trim() != 'tmux') {
        throw 'not in tmux'
    }
    res = await exec("tmux list-panes | wc -l")
    if (res.stdout.trim() != '1') {
        throw 'panes > 1'
    }
    await exec("touch "+md+" "+tmp)
    await exec("tmux split-window -hb")
    await exec("tmux send-keys 'vi -c \"autocmd textchanged,textchangedi *.md silent write\" "+md+" ; tmux kill-pane -a' C-m")
    render()
    fs.watch('./', (_ ,filename) => {
        render()
    })
}

run()
