'use strict';

const HtmlWebpack = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const ChunkWebpack = webpack.optimize.CommonsChunkPlugin;
const ContextReplacementPlugin = webpack.ContextReplacementPlugin;
const LoaderOptionsPlugin = webpack.LoaderOptionsPlugin;

const rootDir = process.cwd();

module.exports = {
    devServer: {
        contentBase: path.resolve(rootDir, 'dist'),
        port: 9000
    },
    devtool: 'source-map',
    entry: {
        app: [ path.resolve(rootDir, 'examples', 'example.main') ],
        vendor: [ path.resolve(rootDir, 'vendor') ]
    },
    module: {
        loaders: [
            { loader: 'raw-loader', test: /\.(s?css|html)$/ },
            {
                exclude: /node_modules/,
                loaders: ['awesome-typescript-loader', 'angular2-template-loader?keepUrl=true'],
                test: /\.ts$/
            }
        ]
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(rootDir, 'dist')
    },
    performance: { hints: false },
    plugins: [
        new ChunkWebpack({
            filename: 'vendor.bundle.js',
            minChunks: Infinity,
            name: 'vendor'
        }),
        new ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            __dirname
        ),
        new LoaderOptionsPlugin({
            debug: true,
            options: {
                emitErrors: true
            }
        }),
        new HtmlWebpack({
            filename: 'index.html',
            inject: 'body',
            template: path.resolve(rootDir, 'examples', 'index.html')
        })
    ],
    resolve: {
        extensions: [ '.js', '.ts' ]
    }
};