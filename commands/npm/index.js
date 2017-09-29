'use strict';

const childProcess = require('child_process');

module.exports = function (rootDir, type) {
    const args = Array.from(arguments).slice(2);
    /* istanbul ignore next */
    const cmd = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';

    return new Promise((resolve, reject) => {
        try {
            childProcess.spawnSync(
                cmd,
                ['run'].concat(getNpmCommand(type, args)),
                { stdio: 'inherit' }
            );
            resolve();
        } catch (error) {
            reject(error.message);
        }
    });
};

const getNpmCommand = (command, args) => {
    switch (command) {
        case 'b':
        case 'build':
            return 'build';
        case 'l':
        case 'lint':
            return 'lint';
        case 'pub':
        case 'publish':
            return ['tagVersion'].concat(args);
        case 'r':
        case 'rel':
        case 'release':
            return ['release'].concat(args);
        case 'v':
        case 'serve':
            return 'start';
        case 't':
        case 'test':
            return ['test'].concat(args);
        default:
            return '';
    }
}
