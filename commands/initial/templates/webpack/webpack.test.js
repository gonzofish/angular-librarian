'use strict';

const path = require('path');
const webpack = require('webpack');

const ContextReplacementPlugin = webpack.ContextReplacementPlugin;
const LoaderOptionsPlugin = webpack.LoaderOptionsPlugin;

module.exports = {
    devtool: 'inline-source-map',
    module: {
        loaders: [
            {
                exclude: /node_modules/,
                loaders: ['awesome-typescript-loader', 'angular2-template-loader?keepUrl=true'],
                test: /\.ts$/
            },
            { loader: 'raw-loader', test: /\.(s?css|html)$/ },
            { enforce: 'pre', exclude: /node_modules/, loader: 'tslint-loader', test: /\.ts$/ }
        ]
    },
    performance: { hints: false },
    plugins: [
        new ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            __dirname
        ),
        new LoaderOptionsPlugin({
            options: {
                emitErrors: true
            }
        })
    ],
    resolve: {
        extensions: ['.js', '.ts'],
        modules: [path.resolve('.', 'src'), path.resolve(rootDir, 'node_modules')],
        moduleExtensions: ['-loader']
    }
};