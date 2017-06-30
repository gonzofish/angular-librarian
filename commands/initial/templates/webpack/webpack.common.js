'use strict';

const fs = require('fs');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

const ContextReplacementPlugin = webpack.ContextReplacementPlugin;
const LoaderOptionsPlugin = webpack.LoaderOptionsPlugin;

const webpackUtils = require('./webpack.utils');
const getAlias = (tsconfigPath) => {
    const tsconfig = require(tsconfigPath);
    const paths = tsconfig.compilerOptions.paths;
    let alias;

    if (paths) {
        alias = Object.keys(paths).reduce((aliases, name) => {
            aliases[name] = webpackUtils.demoPath(paths[name][0]);

            return aliases;
        }, {});
    }

    return alias;
};

const getCommonConfig = (type) => {
    const configFileName = webpackUtils.tsconfigPath(type);
    const alias = getAlias(configFileName);

    return {
        module: {
            rules: [
                {
                    exclude: /node_modules/,
                    test: /\.ts$/,
                    use: [
                        {
                            loader: 'awesome-typescript-loader',
                            query: {
                                configFileName
                            }
                        },
                        {
                            loader: 'angular2-template-loader',
                            query: {
                                keepUrl: true
                            }
                        }
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

module.exports = (type, typeConfig) => {
    const configs = [getCommonConfig(type), typeConfig];
    const customConfigPath = webpackUtils.rootPath('configs', `webpack.${ type }.js`);

    if (fs.existsSync(customConfigPath)) {
        let customConfig = require(customConfigPath);

        if (Object.prototype.toString.call(customConfig) === '[object Function]') {
            customConfig = customConfig();
        }

        configs.push(customConfig);
    }

    return webpackMerge.apply(null, configs);
};
