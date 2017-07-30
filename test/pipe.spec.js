'use strict';

const sinon = require('sinon');
const tap = require('tap');

const pipe = require('../commands/pipe');
const testUtils = require('./test-utils');

const sandbox = sinon.sandbox.create();
const mockOnce = (util, method) => testUtils.mockOnce(sandbox, util, method);

tap.test('command: pipe', (suite) => {
    let make;
    let mocks;

    suite.beforeEach((done) => {
        make = testUtils.makeMake(pipe);
        mocks = testUtils.mock(sandbox);
        done();
    });

    suite.afterEach((done) => {
        sandbox.restore();
        done();
    });

    suite.test('should create a Pipe logger', (test) => {
        test.plan(1);

        make().catch(() => {
            test.ok(mocks.logger.calledWith('Pipe'));

            test.end();
        });
    });

    suite.test('should parse options to check if the pipe is for examples', (test) => {
        const checkForExamples = mockOnce('options', 'checkIsForExamples');
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

    suite.test('should check for a dash-formatted pipe name', (test) => {
        const checkDash = mockOnce('caseConvert', 'checkIsDashFormat');

        test.plan(1);
        make('pizza').catch(() => {
            test.ok(checkDash.calledWith('pizza'));
            test.end();
        });
    });

    suite.test('should ask all questions with a non-dash formatted pipe name', (test) => {
        const checkDash = mockOnce('caseConvert', 'checkIsDashFormat');
        const dashToCamel = testUtils.getUtilMethod('caseConvert', 'dashToCamel');
        const dashToCap = mockOnce('caseConvert', 'dashToCap');
        const inquire = mocks.erector.inquire;

        dashToCap.returns('YouRule');
        test.plan(4);
        make().catch(() => {
            const questions = inquire.lastCall.args[0];
            test.ok(inquire.calledWith([
                {
                    name: 'filename',
                    question: 'Pipe name (in dash-case):',
                    transform: sinon.match.instanceOf(Function)
                },
                {
                    name: 'pipeName',
                    transform: dashToCamel,
                    useAnswer: 'filename'
                },
                {
                    name: 'className',
                    transform: sinon.match.instanceOf(Function),
                    useAnswer: 'filename'
                }
            ]));

            test.equal(questions[0].transform('faux'), null);
            checkDash.returns(true);
            test.equal(questions[0].transform('faux'), 'faux');
            test.equal(questions[2].transform('faux'), 'YouRulePipe');

            test.end();
        });
    });

    suite.test('should ask no questions if a dash-case pipe name is provided', (test) => {
        const answers = [
            { answer: 'donut-dance', name: 'filename' },
            { answer: 'camelCase', name: 'pipeName' },
            { answer: 'PascalCasePipe', name: 'className' }
        ];
        const checkDash = mockOnce('caseConvert', 'checkIsDashFormat');
        const dashToCamel = mockOnce('caseConvert', 'dashToCamel');
        const dashToCap = mockOnce('caseConvert', 'dashToCap');
        const { construct, inquire } = mocks.erector;

        dashToCamel.returns('camelCase');
        dashToCap.returns('PascalCase');
        checkDash.returns(true);
        test.plan(2);

        make('donut-dance').then(() => {
            test.notOk(inquire.called);
            test.ok(construct.calledWith(
                answers,
                'fake-templates'
            ));
            test.end();
        });
    });

    suite.test('should generate a list of templates', (test) => {
        const answers = [
            { answer: 'donut-dance', name: 'filename' },
            { answer: 'camelCase', name: 'pipeName' },
            { answer: 'PascalCasePipe', name: 'className' }
        ];
        const { inquire } = mocks.erector;
        const { getTemplates, log, resolver } = mocks;

        inquire.resetBehavior();
        inquire.resolves(answers);
        test.plan(5);

        make().then(() => {
            test.ok(mocks.getTemplates.calledWith(
                '/root/',
                testUtils.getDirName('pipe'),
                [
                    {
                        destination: '/created/src/pipes/{{ filename }}.pipe.ts',
                        name: 'app.ts'
                    },
                    {
                        destination: '/created/src/pipes/{{ filename }}.pipe.spec.ts',
                        name: 'spec.ts'
                    }
                ]
            ));
            test.equal(log.callCount, 3);
            test.ok(log.firstCall.calledWith(
                `[green]Don't forget to add the following to the[/green]`,
                'src/*.module.ts',
                '[green]file:[/green]'
            ));
            test.ok(log.secondCall.calledWith(
                `    import { PascalCasePipe } from './pipes/donut-dance.pipe';`
            ));
            test.ok(log.thirdCall.calledWith(
                '[green]And to add[/green]',
                'PascalCasePipe',
                '[green]to the NgModule declarations list[/green]'
            ));

            test.end();
        });
    });

    suite.test('should generate a list of templates for an examples target', (test) => {
        const answers = [
            { answer: 'donut-dance', name: 'filename' },
            { answer: 'camelCase', name: 'pipeName' },
            { answer: 'PascalCasePipe', name: 'className' }
        ];const checkForExamples = mockOnce('options', 'checkIsForExamples');
        const { inquire } = mocks.erector;
        const { getTemplates, log, resolver } = mocks;

        checkForExamples.returns(true);
        inquire.resetBehavior();
        inquire.resolves(answers);
        test.plan(5);

        make().then(() => {
            test.ok(mocks.getTemplates.calledWith(
                '/root/',
                testUtils.getDirName('pipe'),
                [
                    {
                        destination: '/created/examples/pipes/{{ filename }}.pipe.ts',
                        name: 'app.ts'
                    },
                    {
                        destination: '/created/examples/pipes/{{ filename }}.pipe.spec.ts',
                        name: 'spec.ts'
                    }
                ]
            ));
            test.equal(log.callCount, 3);
            test.ok(log.firstCall.calledWith(
                `[green]Don't forget to add the following to the[/green]`,
                'examples/example.module.ts',
                '[green]file:[/green]'
            ));
            test.ok(log.secondCall.calledWith(
                `    import { PascalCasePipe } from './pipes/donut-dance.pipe';`
            ));
            test.ok(log.thirdCall.calledWith(
                '[green]And to add[/green]',
                'PascalCasePipe',
                '[green]to the NgModule declarations list[/green]'
            ));

            test.end();
        });
    });

    suite.end();
});