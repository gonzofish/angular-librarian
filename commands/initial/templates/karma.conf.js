module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        plugins: [
            require('karma-chrome-launcher'),
            require('karma-phantomjs-launcher'),
            require('karma-jasmine'),
            require('karma-remap-istanbul')
        ],
        files: [
            { pattern: './src/test.ts', watched: false }
        ],
        preprocessors: {
            './test.ts': ['angular-cli']
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
        singleRun: false
    });
};
