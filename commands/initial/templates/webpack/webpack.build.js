'use strict';

const webpackMerge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');

const webpackCommon = require('./webpack.common');
const webpackUtils = require('./webpack.utils');

module.exports = webpackMerge(webpackCommon('build'), {
    devtool: 'source-map',
    entry: webpackUtils.rootPath('build', 'index.ts'),
    externals: [nodeExternals()],
    module: {
        rules: webpackUtils.buildRules()
    },
    output: {
        filename: '{{ name }}.bundle.js',
        path: webpackUtils.rootPath('dist'),
        libraryTarget: 'umd',
        library: '{{ name }}'
    }
});
