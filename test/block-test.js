import markdown from '../markdown.js'
const assert = require('assert')
const fs = require('fs')
const path = require('path')

const blockDir = "./test/block/"

fs.readdir(blockDir, function(err, files) {
    files.forEach((file) => {
        if (path.extname(file) === '.md') {
            let prefix = file.slice(0, -path.extname(file).length)
            describe('block', () => {
                it(prefix, () => {
                    let text = fs.readFileSync(blockDir + prefix + ".md", "utf-8")
                    let html = fs.readFileSync(blockDir + prefix + ".html", "utf-8")
                    assert.strictEqual(markdown(text.replace(/\r?\n/g, "\n")), html.replace(/\r?\n/g, "\n").replace(/\r?\n$/, ''))
                })
            })
        }
    })
})
