'use strict';

exports.create = (prefix = '') => ({
    error() { notify('error', prefix, arguments); },
    info() { notify('info', prefix, arguments); },
    log() { notify('log', prefix, arguments); },
    warn() { notify('warn', prefix, arguments); }
});

const notify = (type, prefix, args) => {
    args = Array.prototype.slice.call(args);
    console[type].apply(console, [`[${ prefix }]:`].concat(args));
};
