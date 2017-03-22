'use strict';

const path = require('path');
const webpack = require('webpack');
const ContextReplacementPlugin = webpack.ContextReplacementPlugin;
const LoaderOptionsPlugin = webpack.LoaderOptionsPlugin;
const nodeExternals = require('webpack-node-externals');

const rootDir = process.cwd();

module.exports = {
    devtool: 'source-map',
    entry: path.resolve(rootDir, 'src', 'index.ts'),
    externals: [nodeExternals()],
    module: {
        loaders: [
            { loader: 'raw-loader', test: /\.html$/ },
            {
                exclude: /node_modules/,
                loaders: ['style-loader', 'css-loader'],
                test: /\.css$/
            },
            {
                exclude: /node_modules/,
                loaders: ['raw-loader', 'sass-loader'],
                test: /component\.scss$/
            },
            {
                exclude: /node_modules/,
                loaders: ['style-loader', 'css-loader', 'sass-loader'],
                test: /styles\.scss$/
            },
            {
                exclude: /node_modules/,
                loaders: ['awesome-typescript-loader', 'angular2-template-loader'],
                test: /\.ts$/
            },
            {
                loaders: ['url-loader?limit=10000'],
                test: /\.(woff2?|ttf|eot|svg|jpg|jpeg|gif|png)(\?v=\d+\.\d+\.\d+)?$/
            }
        ]
    },
    output: {
        filename: '{{ name }}.bundle.js',
        path: path.resolve(rootDir, 'dist'),
        libraryTarget: 'umd',
        library: '{{ name }}'
    },
    performance: { hints: false },
    plugins: [
        new ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            __dirname
        ),
        new LoaderOptionsPlugin({
            debug: true,
            options: {
                emitErrors: true
            }
        })
    ],
    resolve: {
        extensions: [ '.js', '.ts' ],
        modules: [path.resolve(rootDir, 'node_modules')]
    }
};