'use strict';

const childProcess = require('child_process');

module.exports = function (rootDir, type) {
    const args = Array.from(arguments).slice(2);
    /* istanbul ignore next */
    const cmd = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';

    return new Promise((resolve, reject) => {
        try {
            const output = childProcess.spawnSync(
                cmd,
                ['run'].concat(getNpmCommand(type, args)),
                { stdio: 'inherit' }
            );

            if (output.error) {
                throw output.error;
            } else if (output.status !== 0) {
                throw new Error(`Execution of "${ type }" errored, see above for more information.`);
            } else {
                resolve();
            }
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
