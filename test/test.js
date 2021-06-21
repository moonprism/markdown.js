const test = require('ava')
const fs = require('fs')
const path = require('path')

const markdown = require('../markdown.js')

const testDir = './test/block/'

const beautify = require('js-beautify').html

fs.readdir(testDir, (_, files) => {
    files.forEach(file => {
        if (path.extname(file) === '.md') {
            let name = file.slice(0, -path.extname(file).length)
            test(name, t => {
                let text = fs.readFileSync(testDir + name + ".md", "utf-8").replace(/\r?\n/g, "\n")
                fs.writeFile(testDir+name+'.html', beautify(markdown(text)), 'utf8', err => {})
                //let html = fs.readFileSync(testDir + name + '.html', 'utf-8').replace(/\r?\n/g, '\n').replace(/\r?\n$/, '')
                //t.is(markdown(text), html)
            })
        }
    })
})
