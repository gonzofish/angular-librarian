'use strict';

const sinon = require('sinon');
const tap = require('tap');

const inputs = require('../../resolver')(__filename);

tap.test('#convertYesNoValue', (suite) => {
    const convert = inputs.convertYesNoValue;

    suite.test('should return "Y" if `true` is the value', (test) => {
        test.plan(1);

        test.equal(convert(true), 'Y');

        test.end();
    });

    suite.test('should return "N" if a falsey value is provided', (test) => {
        test.plan(4);

        test.equal(convert(), 'N');
        test.equal(convert(null), 'N');
        test.equal(convert(false), 'N');
        test.equal(convert(0), 'N');

        test.end();
    });

    suite.end();
});

tap.test('#createYesNoValue', (suite) => {
    const create = inputs.createYesNoValue;

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
