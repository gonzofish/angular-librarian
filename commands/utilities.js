'use strict';

const fs = require('fs');
const path = require('path');
const erectorUtils = require('erector-set/src/utils');
let rootDir = process.cwd();

exports.testIsDashFormat = (value) => checkIsDashFormat(value) ? value : null;

const getPackageSelector = (selector = '') => {
    const selectorParts = selector.split('/');
    let pkg;

    if (selectorParts.length > 1) {
        pkg = selectorParts[0];
        selector = selectorParts[1];
    }

    if (!pkg || !checkPackageValidity(pkg)) {
        const packages = getPackages();

        if (packages.length === 1) {
            pkg = packages[0];
        } else {
            pkg = '';
        }
    }

    return {
        pkg,
        selector
    }
};
exports.getPackageSelector = getPackageSelector;

const checkPackageValidity = (pkg) => {
    let valid = checkIsDashFormat(pkg);

    if (valid) {
        valid = getPackages().indexOf(pkg) !== -1;
    }

    return valid;
};
exports.checkPackageValidity = checkPackageValidity;

const checkIsDashFormat = (value) =>
    !!value && typeof value === 'string' &&
    value.length > 0 &&
    value.match(/^[a-z][a-z0-9]*(\-[a-z0-9]+)*$/i);
exports.checkIsDashFormat = checkIsDashFormat;

const getPackages = () => getDirectories(src()).filter((directory) => directory !== 'demo');
exports.getPackages = getPackages;

const getDirectories = (parentDir) =>
    fs.readdirSync(parentDir).filter((child) =>
        fs.lstatSync(path.resolve(parentDir, child)).isDirectory()
    );
exports.getDirectories;

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

const root = function() {
    return joinApply(path.resolve, rootDir, arguments);
};
const src = function() {
    return joinApply(root, 'src', arguments);
};
const demo = function() {
    return joinApply(src, 'demo', arguments);
};
const lib = function() {
    return joinApply(src, '{{ name }}', arguments);
};
const joinApply = (method, prefix, args) =>
    method.apply(null, [prefix].concat(Array.prototype.slice.apply(args)));
exports.dirs = {
    demo,
    joinApply,
    lib,
    src,
    root
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
