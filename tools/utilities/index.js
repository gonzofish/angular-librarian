'use strict';

const caseConvert = require('./case-convert');
const colorize = require('./colorize');
const files = require('./files');
const inputs = require('./inputs');
const options = require('./options');

const addMethods = (mod) => {
    const methods = Object.keys(mod);

    methods.forEach((method) =>
        exports[method] = mod[method]
    );
};

exports.caseConvert = caseConvert;
addMethods(caseConvert);

exports.colorize = colorize;

exports.files = files;
addMethods(files);

exports.inputs = inputs;
addMethods(inputs);

exports.options = options;
addMethods(options);

exports.checkIsScopedName = (name) =>
    // @
    // followed by 1+ non-/
    // followed by /
    // folloer by 1+ non-/
    /^@[^/]+[/][^/]+$/.test(name);
