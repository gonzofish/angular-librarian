'use strict';

const sinon = require('sinon');
const tap = require('tap');

const options = require('../../resolver')(__filename);

tap.test('#checkIsForExamples', (test) => {
    const check = options.checkIsForExamples;

    test.plan(5);

    test.notOk(check({ apple: [], broccoli: [] }));
    test.ok({ example: [] });
    test.ok({ examples: [] });
    test.ok({ x: [] });
    test.ok(check({ apple: [], examples: [] }));

    test.end();
});
