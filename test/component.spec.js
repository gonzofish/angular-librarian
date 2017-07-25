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
    let parseOptions;

    suite.beforeEach((done) => {
        color = sandbox.stub(colorize, 'colorize');
        construct = sandbox.stub(erector, 'construct');
        inquire = sandbox.stub(erector, 'inquire');
        log = sandbox.spy();
        mockLogger = sandbox.stub(logging, 'create');
        parseOptions = sandbox.stub(opts, 'parseOptions');

        color.callsFake((text, color) => `[${ color }]${ text }[/${ color }]`);
        mockLogger.returns({
            error: log,
            info: log,
            log,
            warning: log
        });
        parseOptions.returns({});

        done();
    });

    suite.afterEach((done) => {
        sandbox.restore();
        done();
    });

    suite.test('should parse options via opts.parseOptions', (test) => {
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
        test.plan(1);
        inquire.rejects();
        parseOptions.returns({});

        make('selector', '--yep', '-ise').then(() => {
            test.deepEqual(parseOptions.lastCall.args[0], ['--yep', '-ise']);
            test.end();
        });
    });

    suite.test('should check if the scaffolding is for examples', (test) => {
        const checkForExamples = sandbox.stub(opts, 'checkIsForExamples');
        const options = { pizza: [] };

        test.plan(1);
        inquire.rejects();
        checkForExamples.returns(false);
        parseOptions.resetBehavior();
        parseOptions.returns(options);

        make().then(() => {
            test.ok(checkForExamples.calledWith(options));
            test.end();
        });
    });

    suite.test('should output an error if inquire fails', (test) => {
        test.plan(1);

        inquire.rejects();
        make().then(() => {
            test.ok(log.calledWith(`[red]Error[/red]`));
            test.end();
        });
    })

    /*
        States for asking questions:
        1. default
        2. examples
        3. hooks provided
        4. inline-styles set
        5. inline templates set
    */
    suite.test('should ask all questions if no flags are set and no selector is provided', (test) => {
        test.plan(30);

        inquire.rejects();
        make().then(() => {
            const questions = inquire.lastCall.args[0];
            let question = questions[0];

            // selector
            test.equal(question.name, 'selector');
            test.equal(question.question, 'What is the component selector (in dash-case)?')
            test.equal(typeof question.transform, 'function');

            question = questions[1];
            test.equal(question.name, 'componentName');
            test.equal(typeof question.transform, 'function');
            test.equal(question.useAnswer, 'selector');

            // styling
            question = questions[2];
            test.equal(question.allowBlank, true);
            test.equal(question.name, 'styles');
            test.equal(question.question, 'Use inline styles (y/N)?');
            test.equal(typeof question.transform, 'function');

            question = questions[3];
            test.equal(question.name, 'styleAttribute');
            test.equal(typeof question.transform, 'function');
            test.equal(question.useAnswer, 'styles');

            // template
            question = questions[4];
            test.equal(question.allowBlank, true);
            test.equal(question.name, 'template');
            test.equal(question.question, 'Use inline template (y/N)?');
            test.equal(typeof question.transform, 'function');

            question = questions[5];
            test.equal(question.name, 'templateAttribute');
            test.equal(typeof question.transform, 'function');
            test.equal(question.useAnswer, 'template');

            // lifecycle hooks
            question = questions[6];
            test.equal(question.allowBlank, true);
            test.equal(question.name, 'hooks');
            test.equal(question.question, 'Lifecycle hooks (comma-separated):');
            test.equal(typeof question.transform, 'function');

            question = questions[7];
            test.equal(question.name, 'implements');
            test.equal(typeof question.transform, 'function');
            test.equal(question.useAnswer, 'hooks');

            question = questions[8];
            test.equal(question.name, 'lifecycleNg');
            test.equal(typeof question.transform, 'function');
            test.equal(question.useAnswer, 'hooks');

            test.end();
        });
    });

    suite.end();
});
