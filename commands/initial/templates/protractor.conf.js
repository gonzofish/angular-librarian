const {SpecReporter} = require('jasmine-spec-reporter');
const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const config = require('./webpack/webpack.dev');

const PORT = 9001;

exports.config = {
    allScriptsTimeout: 5000,
    specs: [
        './e2e/**/*.e2e-spec.ts'
    ],
    capabilities: {
        'browserName': 'chrome'
    },
    directConnect: true,
    baseUrl: `http://localhost:${PORT}/`,
    framework: 'jasmine',
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 30000
    },
    beforeLaunch() {
        return new Promise(resolve => {
                let compiler = webpack(config);
        compiler.plugin('done', resolve);
        new WebpackDevServer(compiler, {
            disableHostCheck: true
        }).listen(PORT, 'localhost');
    });
    },
    onPrepare() {
        require('ts-node').register({
            project: 'e2e/tsconfig.e2e.json'
        });

        jasmine.getEnv().addReporter(new SpecReporter({spec: {displayStacktrace: true}}));
    }
};
