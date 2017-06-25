'use strict';

const erectorUtils = require('erector-set/src/utils');
const fs = require('fs');
const path = require('path');

module.exports = function (config) {
    const base = {
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            { pattern: './src/test.js', watched: false }
        ],
        mime: {
            'text/x-typescript': ['ts','tsx']
        },
        plugins: [
            'karma-chrome-launcher',
            'karma-jasmine',
            'karma-phantomjs-launcher',
            'karma-coverage-istanbul-reporter',
            'karma-sourcemap-loader',
            'karma-webpack'
        ],
        preprocessors: {
            './src/test.js': ['webpack', 'sourcemap']
        },
        coverageIstanbulReporter: {
            dir: './coverage',
            fixWebpackSourcePaths: true,
            reports: ['html', 'lcovonly']
        },
        reporters: ['progress', 'coverage-istanbul'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome', 'PhantomJS'],
        singleRun: false,
        webpackServer: { noInfo: true }
    };
    const fullConfig = mergeCustomConfig(base, config);

    config.set(fullConfig);
};

const mergeCustomConfig = (base, karmaConfig) => {
    const customConfigPath = path.resolve(
        process.cwd(),
        'configs',
        'karma.conf.js'
    );
    let fullConfig = base;

    if (fs.existsSync(customConfigPath)) {
        fullConfig = mergeConfigs(base, require(customConfigPath), karmaConfig);
    }

    return fullConfig;
};

const mergeConfigs = (base, custom, karmaConfig) => {
    let mergedConfig = base;

    if (erectorUtils.checkIsType(custom, 'function')) {
        custom = custom(karmaConfig);
    }

    if (custom) {
        mergedConfig = mergeConfigArrays(base, custom);
        mergedConfig = mergeConfigObjects(mergedConfig, custom);
    }

    return mergedConfig;
};

const mergeConfigArrays = (base, custom) => {
    const attributes = ['browsers', 'files', 'plugins', 'reporters'];
    return mergeConfigAttributes(base, custom, attributes, (baseAttribute, customAtt) =>
        erectorUtils.mergeDeep(baseAttribute, customAttribute)
    );
};

const mergeConfigObjects = (base, custom) => {
    const attributes = ['preprocessors'];
    return mergeConfigAttributes(base, custom, attributes, (baseAttribute, customAttribute) =>
        Object.assign(customAttribute, baseAttribute)
    );
};

const mergeConfigPrimitives = (base, custom) => {
    const attributes = ['color', 'logLevel', 'port'];

    return mergeConfigAttributes(base, custom, attributes, (baseAttribute, customAttribute) =>
        customAttribute
    );
};

const mergeConfigAttributes = (base, custom, attributes, callback) => {
    const customAttributes = attributes.reduce((config, attribute) => {
        if (attribute in custom) {
            config[attribute] = callback(base[attribute], custom[attribute]);
        }

        return config;
    }, {});
    let mergedConfig = base;

    if (Object.keys(customAttributes).length > 0) {
        mergedConfig = erectorUtils.mergeDeep(base, customAttributes);
    }

    return mergedConfig;
};
