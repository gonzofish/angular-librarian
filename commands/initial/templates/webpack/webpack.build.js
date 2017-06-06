'use strict';

const ExtractText = require('extract-text-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const ContextReplacementPlugin = webpack.ContextReplacementPlugin;
const LoaderOptionsPlugin = webpack.LoaderOptionsPlugin;
const nodeExternals = require('webpack-node-externals');

const rootDir = process.cwd();
const src = path.resolve(rootDir, 'src');

module.exports = {
    devtool: 'source-map',
    entry: path.resolve(rootDir, 'build', 'index.ts'),
    externals: [nodeExternals()],
    module: {
        loaders: [
            { loader: 'raw-loader', test: /\.html$/ },
            {
                exclude: src,
                loader: ExtractText.extract({
                    fallbackLoader: 'style-loader',
                    loader: 'css-loader?sourceMap'
                }),
                test: /\.css$/
            },
            {
                exclude: /node_modules/,
                loaders: ['css-to-string-loader', 'css-loader', 'sass-loader'],
                test: /\.scss$/
            },
            {
                exclude: /node_modules/,
                loaders: ['css-to-string-loader', 'css-loader'],
                test: /\.css$/
            },
            {
                exclude: /node_modules/,
                loaders: ['awesome-typescript-loader', 'angular2-template-loader?keepUrl=true'],
                test: /\.ts$/
            },
            {
                loaders: ['url-loader?limit=10000'],
                test: /\.(woff2?|ttf|eot|svg|jpg|jpeg|json|gif|png)(\?v=\d+\.\d+\.\d+)?$/
            }
        ]
    },
    output: {
        filename: 'asrc-report-form.bundle.js',
        path: path.resolve(rootDir, 'dist'),
        libraryTarget: 'umd',
        library: 'asrc-report-form'
    },
    performance: { hints: false },
    plugins: [
        new ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)((esm(\\|\/)src|src)(\\|\/)linker|@angular)/,
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
