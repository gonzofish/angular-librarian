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