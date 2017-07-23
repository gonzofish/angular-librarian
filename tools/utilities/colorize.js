'use strict';

const colorMap = {
    blue: 34,
    cyan: 36,
    green: 32,
    red: 31,
    reset: 0,
    yellow: 33
};

exports.colorize = (text, color) => {
    color = color in colorMap ? colorMap[color] : colorMap.reset;

    return `\x1b[${ color }m${ text }\x1b[0m`;
};
