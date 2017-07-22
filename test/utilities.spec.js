'use strict';

const path = require('path');
const sinon = require('sinon');
const tap = require('tap');

const utilities = require('../commands/utilities');

let mockCwd;
let mockResolve;

tap.test('.paths', (suite) => {
    suite.beforeEach((done) => {
        mockCwd = sinon.stub(process, 'cwd');
        mockCwd.returns('root');

        mockResolve = sinon.stub(path, 'resolve');
        mockResolve.callsFake(function() {
            return Array.from(arguments).join('/');
        });

        done();
    });

    suite.afterEach((done) => {
        mockCwd.restore();
        mockResolve.restore();
    });

    suite.test('.create should return a method', (test) => {
        test.plan(2);

        const method = utilities.paths.create('make', 'pizza');

        test.equal(typeof method, 'function');
        test.equal(method('large', 'pepperoni'), 'root/make/pizza/large/pepperoni');

        test.end();
    });

    suite.test('.root should return the root path plus any other arguments', (test) => {
        test.plan(1);

        test.equal(
            utilities.paths.root('burger', 'cheese'),
            'root/burger/cheese'
        );

        test.end();
    });

    suite.end();
});

tap.test('#checkIsDashFormat', (suite) => {
    const check = utilities.checkIsDashFormat;

    suite.test('should return false if no value is provided', (test) => {
        test.plan(4);

        test.notOk(check());
        test.notOk(check(null));
        test.notOk(check(0));
        test.notOk(check(false));

        test.end();
    });

    suite.test('should return false if the value is not a string', (test) => {
        test.plan(3);

        test.notOk(check(1));
        test.notOk(check(true));
        test.notOk(check(function() {}));

        test.end();
    });

    suite.test('should return false if the string has no characters', (test) => {
        test.plan(1);

        test.notOk(check(''));

        test.end();
    });

    suite.test('should return false if it is not dash format (no special characters)', (test) => {
        test.plan(4);

        test.notOk(check('        '));
        test.notOk(check('cant-end-in-a-'));
        test.notOk(check('no-!?$-chars'));
        test.notOk(check('123-cant-start-with-number'));

        test.end();
    });

    suite.test('should return true if it is dash format', (test) => {
        test.plan(2);

        test.ok(check('this-is-good'));
        test.ok(check('numbers-12-3-4-work'));

        test.end();
    });

    suite.end();
});

tap.test('#testIsDashFormat', (suite) => {
    const check = utilities.testIsDashFormat;

    suite.test('should return the value if it is dash format', (test) => {
        test.plan(2);

        test.equal(check('this-is-good'), 'this-is-good');
        test.equal(check('this-15-good'), 'this-15-good');

        test.end();
    });

    suite.test('should return null if the value is not dash format', (test) => {
        test.plan(12);

        test.equal(check(), null);
        test.equal(check(null), null);
        test.equal(check(0), null);
        test.equal(check(false), null);
        test.equal(check(1), null);
        test.equal(check(true), null);
        test.equal(check(function() {}), null);
        test.equal(check(''), null);
        test.equal(check('        '), null);
        test.equal(check('cant-end-in-a-'), null);
        test.equal(check('no-!?$-chars'), null);
        test.equal(check('123-cant-start-with-number'), null);

        test.end();
    });

    suite.end();
});

tap.test('#checkIsForExamples', (test) => {
    const check = utilities.checkIsForExamples;

    test.plan(5);

    test.notOk(check({ apple: [], broccoli: [] }));
    test.ok({ example: [] });
    test.ok({ examples: [] });
    test.ok({ x: [] });
    test.ok(check({ apple: [], examples: [] }));

    test.end();
});

tap.test('#checkIsScopedName', (test) => {
    const check = utilities.checkIsScopedName;

    test.plan(2);

    test.ok(check('@my-scoped/package'));
    test.notOk(check('my-package'));

    test.end();
});

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

tap.test('#createYesNoValue', (suite) => {
    const create = utilities.createYesNoValue;

    suite.test('should return a function', (test) => {
        test.plan(1);
        test.equal(
            typeof create(),
            'function'
        );
        test.end();
    });

    suite.test('should return true for a yes answer & false for a no answer', (test) => {
        const yesNo = create();

        test.plan(6);

        test.ok(yesNo('y'));
        test.ok(yesNo('yes'));
        test.ok(yesNo('YeS'));
        test.notOk(yesNo('n'));
        test.notOk(yesNo('no'));
        test.notOk(yesNo('nO'));

        test.end();
    });

    suite.test('should use a default if provided', (test) => {
        const yesNo = create('y');

        test.plan(2);

        test.notOk(yesNo('n'));
        test.ok(yesNo());

        test.end();
    });

    suite.test('should call a followup function if provided', (test) => {
        const followup = sinon.spy();
        const known = [{ answer: 'hey', name: 'greeting' }];
        const yesNo = create('', known, followup);

        test.plan(3);

        yesNo('unknown');
        test.notOk(followup.called);

        yesNo('n', []);
        test.ok(followup.calledWith(false, known));

        const yesNoKnown = create('', undefined, followup);
        yesNoKnown('y', []);
        test.ok(followup.calledWith(true, []));

        test.end();
    });

    suite.end();
});