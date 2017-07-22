'use strict';

exports.checkIsForExamples = (options) =>
    'example' in options || 'examples' in options || 'x' in options;

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
        const value = split.slice(1).map((value) =>
            value.replace(/,$/, '')
        );

        if (!checkCanAddOption(all, option)) {
            all[option] = value;
        }
    }

    return all;
}, {});

const checkCanAddOption = (all, options) =>
    valid.indexOf(option) !== -1 &&
    !all.hasOwnProperty(option);