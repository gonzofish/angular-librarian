'use strict';

const erectorUtils = require('erector-set/src/utils');

const addMethods = (mod) => {
    const methods = Object.keys(mod);

    methods.forEach((method) =>
        exports[method] = mod[method]
    );
};

addMethods(require('./case-convert'));
addMethods(require('./files'));
addMethods(require('./options'));

exports.checkIsScopedName = (name) =>
    // @
    // followed by 1+ non-/
    // followed by /
    // folloer by 1+ non-/
    /^@[^/]+[/][^/]+$/.test(name);

const colorize = (text, color) => {
    const colorMap = {
        blue: 34,
        cyan: 36,
        green: 32,
        red: 31,
        reset: 0,
        yellow: 33
    };

    color = color in colorMap ? colorMap[color] : colorMap.reset;

    return `\x1b[${ color }m${ text }\x1b[0m`;
};
exports.colorize = colorize;

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
