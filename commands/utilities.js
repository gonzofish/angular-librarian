'use strict';

const fs = require('fs');
const path = require('path');
const erectorUtils = require('erector-set/src/utils');

const resolvePath = (prefix, args) => {
    const argsList = Array.prototype.slice.call(args);

    return path.resolve.apply(path.resolve, [prefix].concat(argsList));
};

exports.paths = {
    create() {
        const base = resolvePath(this.root(), arguments);

        return function() {
            return resolvePath(base, arguments);
        };
    },
    root() {
        return resolvePath(process.cwd(), arguments);
    }
};

exports.testIsDashFormat = (value) => checkIsDashFormat(value) ? value : null;

const checkIsDashFormat = (value) =>
    !!value && typeof value === 'string' &&
    value.length > 0 &&
    value.match(/^[a-z][a-z0-9]*(\-[a-z0-9]+)*$/i);
exports.checkIsDashFormat = checkIsDashFormat;

exports.checkIsForExamples = (options) =>
    'example' in options || 'examples' in options || 'x' in options;

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

const dashToCamel = (value, replaceChar = '') =>
    value.replace(/(-.)/g, (match) => match.replace('-', replaceChar).toUpperCase());
exports.dashToCamel = dashToCamel;

const dashToCap = (value, replaceChar = '') =>
    value[0].toUpperCase() + dashToCamel(value.slice(1), replaceChar);
exports.dashToCap = dashToCap;

exports.dashToWords = (value) =>
    dashToCap(value, ' ');

const deleteFolder = (folder) => {
    if (fs.existsSync(folder)) {
        fs.readdirSync(folder).forEach((file) => removePath(folder, file));
        fs.rmdirSync(folder);
    }
};
exports.deleteFolder = deleteFolder;

const removePath = (folder, file) => {
    const filepath = path.resolve(folder, file);

    if (fs.lstatSync(filepath).isDirectory()) {
        deleteFolder(filepath);
    } else {
        fs.unlinkSync(filepath);
    }
};

exports.getTemplates = (rootDir, directory, filenames) => filenames.map((filename) => ({
    check: filename.check,
    destination: filename.destination || path.resolve(rootDir, filename.name),
    template: filename.blank ? undefined : [directory, 'templates', filename.name].join(path.sep),
    update: filename.update,
    overwrite: filename.overwrite
}));

exports.parseOptions = (options, valid) => options.map((option) => {
    option = option.trim();

    if (option[0] !== '-') {
        option = '=' + option;
    }

    return option;
}).join('').split('-').reduce((all, optionValue) => {
    if (optionValue) {
        const split = optionValue.split('=');
        const option = split[0].replace(/^\-+/, '');
        const value = split.slice(1).map((value) => value.replace(/,$/, ''));

        if (valid.indexOf(option) !== -1 && !all.hasOwnProperty(options)) {
            all[option] = value;
        }
    }

    return all;
}, {});
