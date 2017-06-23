'use strict';

const path = require('path');
const webpack = require('webpack');

const ContextReplacementPlugin = webpack.ContextReplacementPlugin;
const LoaderOptionsPlugin = webpack.LoaderOptionsPlugin;
const SourceMapDevToolPlugin = webpack.SourceMapDevToolPlugin;

const rootDir = process.cwd();

module.exports = (watch) => {
    return {
        devtool: watch ? 'inline-source-map' : 'cheap-module-eval-source-map',
        module: {
            rules: [
                {
                    exclude: /node_modules/,
                    loaders: [
                        'awesome-typescript-loader?configFileName=' + path.resolve(rootDir, 'tsconfig.test.json'),
                        'angular2-template-loader?keepUrl=true'
                    ],
                    use: /\.ts$/
                },
                {
                    test: /\.s?css$/,
                    use: ['raw-loader', 'css-loader', 'sass-loader']
                },
                { test: /\.html$/, use: 'raw-loader' },
                {
                    enforce: 'pre',
                    exclude: /node_modules/,
                    test: /\.ts$/,
                    use: 'tslint-loader'
                },
                {
                    enforce: 'post',
                    exclude: [
                        /node_modules/,
                        /\.(e2e|spec\.)ts$/
                    ],
                    test: /\.ts$/,
                    use: 'istanbul-instrumenter-loader?esModules=true'
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
};
