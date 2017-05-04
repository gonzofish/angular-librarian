'use strict';

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

module.exports = {
    devServer: {
        contentBase: path.resolve(rootDir, 'dist'),
        port: 9000
    },
    devtool: 'source-map',
    entry: {
        app: [ path.resolve(rootDir, 'examples', 'example.main') ],
        scripts: [],
        vendor: [ path.resolve(rootDir, 'src', 'vendor') ],
        styles: [ path.resolve(rootDir, 'examples', 'styles.scss') ]
    },
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
                loaders: ['awesome-typescript-loader', 'angular2-template-loader?keepUrl=true'],
                test: /\.ts$/
            },
            {
                loaders: ['url-loader?limit=10000'],
                test: /\.(woff2?|ttf|eot|svg|jpg|jpeg|gif|png)(\?v=\d+\.\d+\.\d+)?$/
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
            /angular(\\|\/)core(\\|\/)((esm(\\|\/)src|src)(\\|\/)linker|@angular)/,
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
        extensions: [ '.js', '.ts' ],
        modules: [path.resolve(rootDir, 'node_modules')]
    }
};