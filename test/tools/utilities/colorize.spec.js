'use strict';

const tap = require('tap');

const utilities = require('../../resolver')(__filename);

let mockCwd;

tap.test('#colorize should add color escape sequences to text', (test) => {
    const color = utilities.colorize;

    test.plan(6);

    test.equal(
        color('this is blue', 'blue'),
        '\x1b[34mthis is blue\x1b[0m'
    );
    test.equal(
        color('this is cyan', 'cyan'),
        '\x1b[36mthis is cyan\x1b[0m'
    );
    test.equal(
        color('this is green', 'green'),
        '\x1b[32mthis is green\x1b[0m'
    );
    test.equal(
        color('this is red', 'red'),
        '\x1b[31mthis is red\x1b[0m'
    );
    test.equal(
        color('this is yellow', 'yellow'),
        '\x1b[33mthis is yellow\x1b[0m'
    );
    test.equal(
        color('this is default', 'unknown'),
        '\x1b[0mthis is default\x1b[0m'
    );

    test.end();
});