module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        plugins: [
            require('karma-chrome-launcher'),
            require('karma-jasmine'),
            require('karma-phantomjs-launcher'),
            require('karma-remap-istanbul'),
            require('karma-sourcemap-loader'),
            require('karma-webpack')
        ],
        files: [
            { pattern: './src/test.js', watched: false }
        ],
        preprocessors: {
            './src/test.js': ['webpack', 'sourcemap']
        },
        mime: {
            'text/x-typescript': ['ts','tsx']
        },
        remapIstanbulReporter: {
            reports: {
                html: 'coverage',
                lcovonly: './coverage/coverage.lcov'
            }
        },
        reporters: ['progress', 'karma-remap-istanbul'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome', 'PhantomJS'],
        singleRun: false,
        webpack: require('./webpack/webpack.test.js'),
        webpackServer: { noInfo: true }
    });
};
