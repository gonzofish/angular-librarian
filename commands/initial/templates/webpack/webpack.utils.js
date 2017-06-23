'use strict';

const path = require('path');

function rootPath() {
    const rootDir = process.cwd();
    return relayArguments(path.resolve, rootDir, arguments);
}
exports.rootPath = rootPath;

exports.srcPath = function srcPath() {
    return relayArguments(rootPath, 'src', arguments);
};

function relayArguments(method, prefix, args) {
    const pathParts = [prefix].concat(
        Array.prototype.slice.apply(null, args)
    );

    return method.apply(null, pathParts);
}