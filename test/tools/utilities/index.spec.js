'use strict';

const tap = require('tap');

const utilities = require('../../resolver')(__filename);

tap.test('#checkIsScopedName', (test) => {
    const check = utilities.checkIsScopedName;

    test.plan(2);

    test.ok(check('@my-scoped/package'));
    test.notOk(check('my-package'));

    test.end();
});
