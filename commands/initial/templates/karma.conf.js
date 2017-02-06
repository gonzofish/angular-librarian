module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            { pattern: './src/test.js', watched: false }
        ],
        mime: {
            'text/x-typescript': ['ts','tsx']
        },
        plugins: [
            require('karma-chrome-launcher'),
            require('karma-jasmine'),
            require('karma-phantomjs-launcher'),
            require('karma-coverage-istanbul-reporter'),
            require('karma-sourcemap-loader'),
            require('karma-webpack')
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
        webpack: require('./webpack/webpack.test.js'),
        webpackServer: { noInfo: true }
    });
};
