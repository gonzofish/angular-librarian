'use strict';

const childProcess = require('child_process');
const erector = require('erector-set');
const path = require('path');
const process = require('process');
const sinon = require('sinon');
const tap = require('tap');

const initial = require('../commands/initial');
const logger = require('../commands/logging');

let mockErector;
let mockLog;
let mockLogger;

tap.test('initial', (suite) => {
    suite.beforeEach((done) => {
        mockErector = {
            construct: sinon.stub(erector, 'construct'),
            inquire: sinon.stub(erector, 'inquire')
        };

        mockLog = sinon.spy();
        mockLogger = sinon.stub(logger, 'create');
        done();
    });

    suite.afterEach((done) => {
        mockErector.construct.restore();
        mockErector.inquire.restore();

        mockLogger.restore();

        done();
    });

    suite.test('should call erector.inquire with the questions to ask', (test) => {
        test.plan(2);
        mockErector.inquire.rejects();
        mockLogger.returns({
            info: mockLog,
            error: mockLog
        });

        initial('./').then(() => {
            test.ok(mockErector.inquire.called);
            // test.equal(mockErector.inquire.lastCall.args[1], [
            // ]);
            test.ok(mockLog.calledWith('Error'));

            test.end();
        });
    });

    suite.end();
});
