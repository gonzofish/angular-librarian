'use strict';

exports.caseConvert = require('./case-convert');
exports.colorize = require('./colorize');
exports.execute = require('./execute');
exports.files = require('./files');
exports.inputs = require('./inputs');
exports.options = require('./options');

exports.checkIsScopedName = (name) =>
    // @
    // followed by 1+ non-/
    // followed by /
    // folloer by 1+ non-/
    /^@[^/]+[/][^/]+$/.test(name);