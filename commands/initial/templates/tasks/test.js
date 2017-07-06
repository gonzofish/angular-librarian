'use strict';

const fs = require('fs');
const nglUtils = require('angular-librarian/commands/utilities');
const path = require('path');
const Server = require('karma').Server;

const run = (...libs) => {
    const type = libs[0];;
    const config = getConfig(type);
    let args;

    if (checkValidType(type)) {
        libs = libs.slice(1);
    }

    libs = getValidLibs(libs);

    fs.unlinkSync('./ngl.helpers.js');
    fs.writeFileSync('./ngl.helpers.js', 'window.ngl=' + JSON.stringify({ libs }));
    const server = new Server(config, function(exitCode) {
        process.exit(exitCode);
    });
    server.start();
};

const checkValidType = (type) =>
    ['headless', 'all', 'watch'].indexOf(type) !== -1

const getValidLibs = (provided) => {
    const packages = nglUtils.getPackages();
    let valid = packages.filter((pkg) => provided.indexOf(pkg) !== -1);

    if (valid.length === 0) {
        valid = [''];
    }

    return valid;
};

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
    let config = getAllConfig(true);

    config.browsers = ['Chrome'];

    return config;
}

const getAllConfig = (watch) => ({
    configFile: path.resolve(__dirname, '..', 'karma.conf.js'),
    webpack: require(path.resolve(__dirname, '..', 'webpack', 'webpack.test.js'))(watch),
});

module.exports = run;

if (!module.parent) {
    run.apply(null, process.argv.slice(2));
}
