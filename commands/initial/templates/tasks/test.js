'use strict';

const path = require('path');
const Server = require('karma').Server;

function run(type) {
    const config = getConfig(type);
    const server = new Server(config, function(exitCode) {
        process.exit(exitCode);
    });

    server.start();
}

function getConfig(type) {
    switch (type) {
        case 'headless':
            return getHeadlessConfig();
        case 'all':
            return getAllConfig();
        case 'watch':
            return getWatchConfig();
        default:
            return getSingleConfig();
    }
}

function getSingleConfig() {
    let config = getHeadlessConfig();

    config.singleRun = true;

    return config;
}

function getHeadlessConfig() {
    let config = getAllConfig();

    config.browsers = ['PhantomJS'];

    return config;
}

function getWatchConfig() {
    let config = getAllConfig();

    config.browsers = ['Chrome'];

    return config;
}

function getAllConfig() {
    return {
        configFile: path.resolve(process.cwd(), './karma.conf.js')
    };
}

module.exports = run;

if (!module.parent) {
    run(process.argv[2]);
}
