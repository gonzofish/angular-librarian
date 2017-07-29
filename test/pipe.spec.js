'use strict';

const sinon = require('sinon');
const tap = require('tap');

const pipe = require('../commands/pipe');
const testUtils = require('./test-utils.js');

const sandbox = sinon.sandbox.create();

tap.test('command: pipe', (suite) => {
    let make;
    let mocks;

    suite.beforeEach((done) => {
        make = testUtils.makeMake(pipe);
        mocks = testUtils.mock(sandbox);
        done();
    });

    suite.afterEach((done) => sandbox.restore());

    suite.test('should create a Pipe logger', (test) => {
        test.plan(1);

        make().catch(() => {
            test.ok(mocks.logger.calledWith('Pipe'));

            test.end();
        });
    });

    suite.test('should parse options to check if the pipe is for examples', (test) => {
        const checkForExamples = testUtils.singleMock(sandbox, 'options', 'checkIsForExamples');
        const options = { burger: [], b: [] };
        const { parseOptions } = mocks;
        test.plan(2);

        parseOptions.resetBehavior();
        parseOptions.returns(options);

        make('--burger', 'b').catch(() => {
            test.ok(parseOptions.calledWith(
                ['--burger', 'b'],
                ['example', 'examples', 'x']
            ));
            test.ok(checkForExamples.calledWith(options));

            test.end();
        });
    });

    suite.end();
});