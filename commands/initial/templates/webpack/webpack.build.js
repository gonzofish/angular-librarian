'use strict';

const ExtractText = require('extract-text-webpack-plugin');
const webpackMerge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');

const webpackCommon = require('./webpack.common');
const webpackUtils = require('./webpack.utils');

module.exports = webpackMerge(webpackCommon('build'), {
    devtool: 'source-map',
    entry: webpackUtils.rootPath('build', 'index.ts'),
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                exclude: webpackUtils.srcPath(),
                use: ExtractText.extract({
                    fallback: 'style-loader',
                    use: 'css-loader?sourceMap'
                }),
                test: /\.css$/
            },
            {
                exclude: /node_modules/,
                use: ['css-to-string-loader', 'css-loader', 'sass-loader'],
                test: /\.scss$/
            },
            {
                exclude: /node_modules/,
                use: ['css-to-string-loader', 'css-loader'],
                test: /\.css$/
            }
        ]
    },
    output: {
        filename: '{{ name }}.bundle.js',
        path: webpackUtils.rootPath('dist'),
        libraryTarget: 'umd',
        library: '{{ name }}'
    }
});
