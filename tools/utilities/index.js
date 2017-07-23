'use strict';

const erectorUtils = require('erector-set/src/utils');

const addMethods = (mod) => {
    const methods = Object.keys(mod);

    methods.forEach((method) =>
        exports[method] = mod[method]
    );
};

addMethods(require('./case-convert'));
addMethods(require('./colorize'));
addMethods(require('./files'));
addMethods(require('./options'));

exports.checkIsScopedName = (name) =>
    // @
    // followed by 1+ non-/
    // followed by /
    // folloer by 1+ non-/
    /^@[^/]+[/][^/]+$/.test(name);

exports.createYesNoValue = (defaultValue, knownAnswers, followup) => (value, answers) => {
    const lookup = { n: false, y: true };
    let result;

    if (typeof value === 'string' && value.match(/^(y(es)?|no?)$/i)) {
        value = value.slice(0, 1).toLowerCase();
    } else if (!value && !!defaultValue) {
        value = defaultValue.toLowerCase();
    }

    result = lookup[value];
    if (result !== undefined && typeof followup === 'function') {
        result = followup(result, answers.concat(knownAnswers || []));
    }

    return result;
};

exports.convertYesNoValue = (value) => {
    if (erectorUtils.checkIsType(value, 'boolean')) {
        value = value ? 'Y' : 'N';
    } else if (!value) {
        value = 'N';
    }

    return value;
};
