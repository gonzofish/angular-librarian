'use strict';

const sinon = require('sinon');
const tap = require('tap');

const logging = require('../resolver')(__filename);

tap.test('#create', (suite) => {
    const create = logging.create;

    suite.test('should return an object with 4 log methods', (test) => {
        test.plan(4);

        const logger = create();
        const methods = Object.keys(logger);

        methods.forEach((method) => {
            test.equal(typeof logger[method], 'function');
        });

        test.end();
    });

    suite.test('should call the analgous console method with any arguments', (test) => {
        test.plan(4);

        const errorSpy = sinon.stub(console, 'error');
        const infoSpy = sinon.stub(console, 'info');
        const logSpy = sinon.stub(console, 'log');
        const warnSpy = sinon.stub(console, 'warn');

        const logger = create('pizza');

        logger.error('this is an error');
        logger.info('here is some info');
        logger.log('log message');
        logger.warn('do not make me warn you');

        test.ok(errorSpy.calledWith('[pizza]:', 'this is an error'));
        test.ok(infoSpy.calledWith('[pizza]:', 'here is some info'));
        test.ok(logSpy.calledWith('[pizza]:', 'log message'));
        test.ok(warnSpy.calledWith('[pizza]:', 'do not make me warn you'));

        errorSpy.reset();
        infoSpy.reset();
        logSpy.reset();
        warnSpy.reset();

        test.end();
    });

    suite.end();
});
