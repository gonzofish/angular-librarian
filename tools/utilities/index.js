'use strict';

const addMethods = (mod) => {
    const methods = Object.keys(mod);

    methods.forEach((method) =>
        exports[method] = mod[method]
    );
};

addMethods(require('./case-convert'));
addMethods(require('./colorize'));
addMethods(require('./files'));
addMethods(require('./inputs'));
addMethods(require('./options'));

exports.checkIsScopedName = (name) =>
    // @
    // followed by 1+ non-/
    // followed by /
    // folloer by 1+ non-/
    /^@[^/]+[/][^/]+$/.test(name);
