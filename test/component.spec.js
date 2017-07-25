'use strict';

const erector = require('erector-set');
const sinon = require('sinon');
const tap = require('tap');

const component = require('../commands/component');
const logging = require('../commands/logging');
const utilities = require('../commands/utilities');

const colorize = utilities.colorize;
const make = (...args) => component.apply(null, ['./'].concat(Array.from(args)));
const opts = utilities.options;
const sandbox = sinon.sandbox.create();

tap.test('command: component', (suite) => {
    let color;
    let construct;
    let inquire;
    let log;
    let mockLogger;

    suite.beforeEach((done) => {
        color = sandbox.stub(colorize, 'colorize');
        construct = sandbox.stub(erector, 'construct');
        inquire = sandbox.stub(erector, 'inquire');
        log = sandbox.spy();
        mockLogger = sandbox.stub(logging, 'create');

        color.callsFake((text, color) => `[${ color }]${ text }[/${ color }]`);
        mockLogger.returns({
            error: log,
            info: log,
            log,
            warning: log
        });

        done();
    });

    suite.afterEach((done) => {
        sandbox.restore();
        done();
    });

    suite.test('should parse options via opts.parseOptions', (test) => {
        const parseOptions = sandbox.stub(opts, 'parseOptions');

        test.plan(1);
        inquire.rejects();

        parseOptions.returns({});
        make('--a', 'big', 'deal').then(() => {
            test.ok(parseOptions.calledWith(['--a', 'big', 'deal'], [
                'default', 'defaults', 'd',
                'example', 'examples', 'x',
                'hooks', 'h',
                'inline-styles', 'is',
                'inline-template', 'it'
            ]));
            test.end();
        });
    });

    suite.test('should parse with a known selector if the first option is not dash-prefixed', (test) => {
        const parseOptions = sandbox.stub(opts, 'parseOptions');

        test.plan(1);
        inquire.rejects();
        parseOptions.returns({});

        make('selector', '--yep', '-ise').then(() => {
            test.deepEqual(parseOptions.lastCall.args[0], ['--yep', '-ise']);
            test.end();
        });
    });

    suite.end();
});
