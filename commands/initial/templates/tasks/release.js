'use strict';

const childProcess = require('child_process');

module.exports = (type) => {
    const extraArgument = getCommand(type);

    return new Promise((resolve, reject) => {
        try {
            childProcess.spawnSync(
                'np',
                ['--no-publish'].concat(extraArgument),
                { stdio: 'inherit' }
            );
            resolve();
        } catch (error) {
            reject(error.message);
        }
    });
};

const getCommand = (type) => {
    switch (type) {
        case 'nc':
        case 'no-cleanup':
            return '--no-cleanup';
        case 'y':
        case 'yolo':
            return '--yolo';
        default:
            return '';
    }
}

if (!module.parent) {
    module.exports(process.argv[2]);
}
