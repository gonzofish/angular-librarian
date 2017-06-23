'use strict';

const ExtractText = require('extract-text-webpack-plugin');
const HtmlWebpack = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const ChunkWebpack = webpack.optimize.CommonsChunkPlugin;
const ContextReplacementPlugin = webpack.ContextReplacementPlugin;
const LoaderOptionsPlugin = webpack.LoaderOptionsPlugin;

const entryPoints = [
    'vendor',
    'scripts',
    'styles',
    'app'
];
const rootDir = process.cwd();
const examples = path.resolve(rootDir, 'examples');
const src = path.resolve(rootDir, 'src');

module.exports = {
    devServer: {
        contentBase: path.resolve(rootDir, 'dist'),
        port: 9000
    },
    devtool: 'source-map',
    entry: {
        app: [ path.resolve(examples, 'example.main') ],
        scripts: [],
        vendor: [ path.resolve(src, 'vendor') ],
        styles: [ path.resolve(examples, 'styles.scss') ]
    },
    module: {
        rules: [
            { test: /\.html$/, use: 'raw-loader' },
            {
                exclude: [src, examples],
                test: /\.css$/,
                use: ExtractText.extract({
                    fallbackLoader: 'style-loader',
                    loader: 'css-loader?sourceMap'
                })
            },
            {
                exclude: [path.resolve(examples, 'styles.scss'), /node_modules/],
                test: /\.scss$/,
                use: ['css-to-string-loader', 'css-loader', 'sass-loader']
            },
            {
                include: examples,
                test: /styles\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                exclude: /node_modules/,
                test: /\.css$/,
                use: ['css-to-string-loader', 'css-loader']
            },
            {
                exclude: /node_modules/,
                test: /\.ts$/,
                use: ['awesome-typescript-loader', 'angular2-template-loader?keepUrl=true']
            },
            {
                test: /\.(woff2?|ttf|eot|svg|jpg|jpeg|json|gif|png)(\?v=\d+\.\d+\.\d+)?$/,
                use: ['url-loader?limit=10000']
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
            /angular(\\|\/)core(\\|\/)@angular/,
            __dirname
        ),
        new LoaderOptionsPlugin({
            debug: true,
            options: {
                emitErrors: true
            }
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
            template: path.resolve(rootDir, 'examples', 'index.html')
        })
    ],
    resolve: {
        extensions: [ '.js', '.ts' ],
        modules: [path.resolve(rootDir, 'node_modules')]
    }
};
