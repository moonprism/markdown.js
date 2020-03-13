const path = require('path');
module.exports = {
    entry: './markdown.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'markdown.min.js',
        library: 'markdown',
        publicPath: '/example/',
    },
    devServer: {
        open: true,
        openPage: 'example/'
    }
};