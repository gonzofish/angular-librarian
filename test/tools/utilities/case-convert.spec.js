'use strict';

const sinon = require('sinon');
const tap = require('tap');

const caseConvert = require('../../resolver')(__filename);

tap.test('#checkIsDashFormat', (suite) => {
    const check = caseConvert.checkIsDashFormat;

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
    const check = caseConvert.testIsDashFormat;

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

tap.test('#dashToCamel should convert a dash-case to camel case', (test) => {
    const convert = caseConvert.dashToCamel;

    test.plan(3);

    test.equal(convert('this-is-camel-case'), 'thisIsCamelCase');
    test.equal(convert('this-is-camel-case', '~'), 'this~Is~Camel~Case');
    test.equal(convert('startedAsACamel'), 'startedAsACamel');

    test.end();
});

tap.test('#dashToCap should convert a dash-case to Pascal case', (test) => {
    const convert = caseConvert.dashToCap;

    test.plan(3);

    test.equal(convert('this-is-pascal-case'), 'ThisIsPascalCase');
    test.equal(convert('this-is-pascal-case', '~'), 'This~Is~Pascal~Case');
    test.equal(convert('StartedAsAPascal'), 'StartedAsAPascal');

    test.end();
});

tap.test('#dashToWords should convert a dash-case to separate words', (test) => {
    const convert = caseConvert.dashToWords;

    test.plan(2);

    test.equal(convert('here-is-a-sentence'), 'Here Is A Sentence');
    test.equal(convert('Nothing to change'), 'Nothing to change');

    test.end();
});
