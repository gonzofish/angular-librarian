'use strict';

const HtmlWebpack = require('html-webpack-plugin');
const webpack = require('webpack');

const ChunkWebpack = webpack.optimize.CommonsChunkPlugin;
const webpackCommon = require('./webpack.common');
const webpackUtils = require('./webpack.utils');

const entryPoints = [
    'vendor',
    'scripts',
    'styles',
    'app'
];
const demoPath = webpackUtils.demoPath;

module.exports = webpackCommon('demo', {
    devServer: {
        contentBase: demoPath('dist'),
        port: 9000
    },
    devtool: 'cheap-module-eval-source-map',
    entry: {
        app: [ demoPath('example.main') ],
        scripts: [],
        vendor: [ demoPath('vendor') ],
        styles: [ demoPath('styles.scss') ]
    },
    module: {
        rules: webpackUtils.buildRules({
            cssExtract: demoPath(),
            sassLoader: demoPath('styles.scss')
        }, {
            include: demoPath(),
            test: /styles\.scss$/,
            use: ['style-loader', 'css-loader', 'sass-loader']
        })
    },
    output: {
        filename: '[name].bundle.js',
        path: demoPath('dist')
    },
    plugins: [
        new ChunkWebpack({
            filename: 'vendor.bundle.js',
            minChunks: Infinity,
            name: 'vendor'
        }),
        new HtmlWebpack({
            // shameless/shamefully stolen from Angular CLI
            chunksSortMode: function(left, right) {
                const leftIndex = entryPoints.indexOf(left.names[0]);
                const rightIndex = entryPoints.indexOf(right.names[0]);
                let direction = 0;

                if (leftIndex > rightIndex) {
                    direction = 1;
                } else if (leftIndex < rightIndex) {
                    direction = -1;
                }

                return direction;
            },
            filename: 'index.html',
            inject: 'body',
            template: demoPath('index.html')
        })
    ]
});

