'use strict';

const path = require('path');
const webpack = require('webpack');

const ContextReplacementPlugin = webpack.ContextReplacementPlugin;
const LoaderOptionsPlugin = webpack.LoaderOptionsPlugin;
const SourceMapDevToolPlugin = webpack.SourceMapDevToolPlugin;

const rootDir = process.cwd();

module.exports = {
    devtool: 'inline-source-map',
    module: {
        loaders: [
            {
                exclude: /node_modules/,
                test: /\.ts$/,
                loaders: [
                    'awesome-typescript-loader?configFileName=' + path.resolve(rootDir, 'tsconfig.test.json'),
                    'angular2-template-loader?keepUrl=true'
                ],
            },
            { loader: 'raw-loader', test: /\.(s?css|html)$/ },
            {
                enforce: 'pre',
                exclude: /node_modules/,
                loader: 'tslint-loader',
                test: /\.ts$/
            },
            {
                enforce: 'post',
                exclude: [
                    /node_modules/,
                    /\.(e2e|spec\.)ts$/
                ],
                loader: 'istanbul-instrumenter-loader?esModules=true',
                test: /\.ts$/
            }
        ]
    },
    performance: { hints: false },
    plugins: [
        new ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)((esm(\\|\/)src|src)(\\|\/)linker|@angular)/,
            __dirname
        ),
        new LoaderOptionsPlugin({
            options: {
                emitErrors: true
            }
        }),
        new SourceMapDevToolPlugin({
            filename: null,
            test: /\.ts$/
        })
    ],
    resolve: {
        extensions: ['.js', '.ts'],
        modules: [path.resolve('.', 'src'), path.resolve(rootDir, 'node_modules')],
        moduleExtensions: ['-loader']
    }
};