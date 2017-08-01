'use strict';

const sinon = require('sinon');
const tap = require('tap');

const service = require('../commands/service');
const testUtils = require('./test-utils');

const sandbox = sinon.sandbox.create();
const mockOnce = (util, method) => testUtils.mockOnce(sandbox, util, method);

tap.test('command: service', (suite) => {
    let make;
    let mocks;

    suite.beforeEach((done) => {
        make = testUtils.makeMake(service);
        mocks = testUtils.mock(sandbox);

        done();
    });

    suite.afterEach((done) => {
        sandbox.restore();
        done();
    });

    suite.test('should create a Service logger', (test) => {
        test.plan(1);

        make().catch(() => {
            test.ok(mocks.logger.calledWith('Service'));
            test.end();
        });
    });

    suite.test('should parse options to check if the service is for examples', (test) => {
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

    suite.test('should check for a dash-formatted service name', (test) => {
        const checkDash = mockOnce('caseConvert', 'checkIsDashFormat');

        test.plan(1);
        make('pizza').catch(() => {
            test.ok(checkDash.calledWith('pizza'));
            test.end();
        });
    });

    suite.test('should ask all questions with a non-dash formatted service name', (test) => {
        const checkDash = mockOnce('caseConvert', 'checkIsDashFormat');
        const dashToCap = mockOnce('caseConvert', 'dashToCap');
        const inquire = mocks.erector.inquire;

        dashToCap.returns('YouRule');
        test.plan(4);
        make().catch(() => {
            const questions = inquire.lastCall.args[0];
            test.ok(inquire.calledWith([
                {
                    name: 'filename',
                    question: 'Service name (in dash-case):',
                    transform: sinon.match.instanceOf(Function)
                },
                {
                    name: 'serviceName',
                    transform: sinon.match.instanceOf(Function),
                    useAnswer: 'filename'
                }
            ]));

            test.equal(questions[0].transform('faux'), null);
            checkDash.returns(true);
            test.equal(questions[0].transform('faux'), 'faux');
            test.equal(questions[1].transform('faux'), 'YouRuleService');

            test.end();
        });
    });

    suite.test('should ask no questions if a dash-case serivce name is provided', (test) => {
        const answers = [
            { answer: 'donut-dance', name: 'filename' },
            { answer: 'PascalCaseService', name: 'serviceName' }
        ];
        const checkDash = mockOnce('caseConvert', 'checkIsDashFormat');
        const dashToCap = mockOnce('caseConvert', 'dashToCap');
        const { construct, inquire } = mocks.erector;

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
            { answer: 'PascalCaseService', name: 'serviceName' }
        ];
        const { inquire } = mocks.erector;
        const { getTemplates, log, resolver } = mocks;

        inquire.resetBehavior();
        inquire.resolves(answers);
        test.plan(5);

        make().then(() => {
            test.ok(mocks.getTemplates.calledWith(
                '/root/',
                testUtils.getDirName('service'),
                [
                    {
                        destination: '/created/src/services/{{ filename }}.service.ts',
                        name: 'app.ts'
                    },
                    {
                        destination: '/created/src/services/{{ filename }}.service.spec.ts',
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
                `    import { PascalCaseService } from './services/donut-dance.service';`
            ));
            test.ok(log.thirdCall.calledWith(
                '[green]And to add[/green]',
                'PascalCaseService',
                '[green]to the NgModule providers list or add as a provider to one or more components[/green]'
            ));

            test.end();
        });
    });

    suite.test('should generate a list of templates for an examples target', (test) => {
        const answers = [
            { answer: 'donut-dance', name: 'filename' },
            { answer: 'PascalCaseService', name: 'serviceName' }
        ];
        const checkForExamples = mockOnce('options', 'checkIsForExamples');
        const { inquire } = mocks.erector;
        const { getTemplates, log, resolver } = mocks;

        checkForExamples.returns(true);
        inquire.resetBehavior();
        inquire.resolves(answers);
        test.plan(5);

        make().then(() => {
            test.ok(mocks.getTemplates.calledWith(
                '/root/',
                testUtils.getDirName('service'),
                [
                    {
                        destination: '/created/examples/services/{{ filename }}.service.ts',
                        name: 'app.ts'
                    },
                    {
                        destination: '/created/examples/services/{{ filename }}.service.spec.ts',
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
                `[cyan]    import { PascalCaseService } from './services/donut-dance.service';[/cyan]`
            ));
            test.ok(log.thirdCall.calledWith(
                '[green]And to add[/green]',
                'PascalCaseService',
                '[green]to the NgModule providers list or add as a provider to one or more components[/green]'
            ));

            test.end();
        });
    });

    suite.test('should generate the app & spec files', (test) => {
        const { erector, getTemplates } = mocks;
        const { construct, inquire } = erector;
        const answers = [
            { answer: 'pizza-party', name: 'filename' },
            { answer: 'PizzaPartyService', name: 'serviceName' }
        ];
        const appOutput =
            `import { Injectable } from '@angular/core';\n` +
            `\n` +
            `@Injectable()\n` +
            `export class PizzaPartyService {\n` +
            `    constructor() {}\n` +
            `}\n`;
        const specOutput =
            `/* tslint:disable:no-unused-vars */\n` +
            `import {\n` +
            `    getTestBed,\n` +
            `    TestBed\n` +
            `} from '@angular/core/testing';\n` +
            `\n` +
            `import { PizzaPartyService } from './pizza-party.service';\n` +
            `\n` +
            `describe('PizzaPartyService', () => {\n` +
            `    let service: PizzaPartyService;\n` +
            `\n` +
            `    beforeEach(() => {\n` +
            `        TestBed.configureTestingModule({\n` +
            `            providers: [PizzaPartyService]\n` +
            `        });\n` +
            `        service = getTestBed().get(PizzaPartyService);\n` +
            `    });\n` +
            `\n` +
            `    it('', () => {\n` +
            `        expect(service).toBeTruthy();\n` +
            `    });\n` +
            `});\n`;

        construct.callThrough();
        getTemplates.resetBehavior();
        getTemplates.callThrough();
        inquire.resetBehavior();
        inquire.resolves(answers);

        test.plan(1);

        make().then((result) => {
            test.deepEqual(result, [
                {
                    destination: '/created/src/services/pizza-party.service.ts',
                    output: appOutput
                },
                {
                    destination: '/created/src/services/pizza-party.service.spec.ts',
                    output: specOutput
                }
            ]);
            test.end();
        });
    });

    suite.end();
});
