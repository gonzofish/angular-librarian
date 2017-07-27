'use strict';

exports.checkIsForExamples = (options) =>
    exports.checkHasOption(options, ['example', 'examples', 'x']);

exports.checkHasOption = (options, valid) =>
    !!valid.find((option) => option in options);

exports.parseOptions = (candidates, valid) =>
    createOptionsMap(formatOptions(candidates), valid);

const formatOptions = (candidates) => candidates.reduce((options, candidate) => {
    candidate = candidate.trim();

    if (candidate.substring(0, 2) === '--') {
        options = options.concat(candidate);
    } else if (candidate[0] === '-') {
        options = options.concat(candidate.substring(1).split('').map((option) => '-' + option));
    } else {
        options = addValueToLastOption(options, candidate);
    }

    return options;
}, []);

const addValueToLastOption = (options, candidate) => {
    let option = options[options.length - 1];
    let separator = ',';

    if (option && option.substring(0, 2) === '--' && candidate) {
        if (option.indexOf('=') === -1) {
            separator = '=';
        }

        options = options.slice(0, -1).concat(option + separator + candidate);
    }

    return options;
};

const createOptionsMap = (candidates, valid) => candidates.reduce((options, candidate) => {
    const parts = candidate.split('=');
    const option = parts[0].replace(/^--?/, '');
    const values = parts[1] ? parts[1].split(',').map(convertToType) : [];

    if (checkCanAddOption(options, option, valid)) {
        options[option] = values;
    }

    return options;
}, {});

const convertToType = (value) => {
    try {
        // this will take ANYTHING, so a IIFE
        // will get parsed...but for an app like
        // this, it's ok
        value = eval(value);
    } catch (e) {}

    return value;
};

const checkCanAddOption = (options, option, valid) =>
    (!valid || valid.length === 0 || valid.indexOf(option) !== -1) &&
    !options.hasOwnProperty(option);