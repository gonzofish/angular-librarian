'use strict';

const webpack = require('webpack');
    const ContextReplacementPlugin = webpack.ContextReplacementPlugin;
const LoaderOptionsPlugin = webpack.LoaderOptionsPlugin;

const webpackUtils = require('./webpack.utils');

module.exports = (type) => {
    const tsconfigType = type ? `.${ type }` : '';

    return {
        module: {
            rules: [
                {
                    exclude: /node_modules/,
                    test: /\.ts$/,
                    use: [
                        'awesome-typescript-loader?configFileName=' + webpackUtils.rootPath(`tsconfig${ tsconfigType }.json`),
                        'angular2-template-loader?keepUrl=true'
                    ]
                },
                { test: /\.html$/, use: 'raw-loader' },
                {
                    use: ['url-loader?limit=10000'],
                    test: /\.(woff2?|ttf|eot|svg|jpg|jpeg|json|gif|png)(\?v=\d+\.\d+\.\d+)?$/
                }
            ]
        },
        performance: { hints: false },
        plugins: [
            new ContextReplacementPlugin(
                /angular(\\|\/)core(\\|\/)@angular/,
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
            modules: [ webpackUtils.rootPath('node_modules') ]
        }
    };
};
