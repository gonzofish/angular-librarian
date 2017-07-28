'use strict';

const erector = require('erector-set');
const path = require('path');
const sinon = require('sinon');
const tap = require('tap');

const directive = require('../commands/directive');
const logging = require('../tools/logging');
const utilities = require('../tools/utilities');

const caseConvert = utilities.caseConvert;
const files = utilities.files;
const opts = utilities.options;
const sandbox = sinon.sandbox.create();

const make = function() {
    return directive.apply(directive, ['./'].concat(Array.from(arguments)));
};

let checkForExamples;
let construct;
let creator;
let dashToCap;
let getTemplates;
let inquire;
let log;
let logger;
let parseOptions;
let rooter;
let testDashFormat;

tap.test('command: directive', (suite) => {
    suite.beforeEach((done) => {
        checkForExamples = sandbox.stub(opts, 'checkIsForExamples');
        construct = sandbox.stub(erector, 'construct');
        creator = sandbox.stub(files.resolver, 'create');
        getTemplates = sandbox.stub(files, 'getTemplates');
        inquire = sandbox.stub(erector, 'inquire');
        logger = sandbox.stub(logging, 'create');
        log = sandbox.spy();
        parseOptions = sandbox.stub(opts, 'parseOptions');
        rooter = sandbox.stub(files.resolver, 'root');

        creator.callsFake(function() {
            const createPath = Array.from(arguments).join('/');
            return function() {
                return `/created/${ createPath }/` + Array.from(arguments).join('/');
            };
        });
        getTemplates.returns('fake-templates');
        inquire.rejects();
        logger.returns({
            info: log,
            log: log,
            error: log,
            warning: log
        });
        parseOptions.returns({});
        rooter.callsFake(function() {
            return '/root/' + Array.from(arguments).join('/');
        });

        done();
    });

    suite.afterEach((done) => {
        sandbox.restore();
        done();
    });

    suite.test('should create a Directive logger', (test) => {
        test.plan(1);

        make().catch(() => {
            test.ok(logger.calledWith('Directive'));
            test.end();
        });
    });

    suite.test('should parse options from arguments to check for examples', (test) => {
        const options = { pizza: [], p: [], i: [], steak: ['sauce'] };
        test.plan(2);

        parseOptions.resetBehavior();
        parseOptions.returns(options);

        make('--pizza', '--steak', '-pie').catch(() => {
            test.ok(parseOptions.calledWith(
                ['--pizza', '--steak', '-pie'],
                ['example', 'examples', 'x']
            ));
            test.ok(checkForExamples.calledWith(options));
            test.end();
        });
    });

    suite.test('should ask no questions if a dash-case directive name is provided', (test) => {
        const answers = [
            { answer: 'bacon-blast', name: 'name' },
            { answer: 'PascalCaseDirective', name: 'className' },
            { answer: 'camelCase', name: 'selector' }
        ];
        const checkDashFormat = sandbox.stub(caseConvert, 'checkIsDashFormat');
        const dashToCamel = sandbox.stub(caseConvert, 'dashToCamel');
        const dashToCap = sandbox.stub(caseConvert, 'dashToCap');

        checkForExamples.returns(false);
        dashToCamel.returns('camelCase');
        dashToCap.returns('PascalCase');
        checkDashFormat.returns(true);
        test.plan(2);
        make('bacon-blast').then(() => {
            test.notOk(inquire.called);
            test.ok(construct.calledWith(
                answers,
                'fake-templates'
            ));
            test.end();
        });
    });

    suite.test('should ask for a selector name in dash-case if NOT provided', (test) => {
        const dashToCap = sandbox.stub(caseConvert, 'dashToCap');
        test.plan(2);

        dashToCap.returned('DashToCap');

        make().catch(() => {
            const { transform } = inquire.lastCall.args[0][2];

            test.ok(inquire.calledWith([
                {
                    name: 'name',
                    question: 'Directive name (in dash-case):',
                    transform: caseConvert.testIsDashFormat
                },
                {
                    name: 'selector',
                    transform: caseConvert.dashToCamel,
                    useAnswer: 'name'
                },
                {
                    name: 'className',
                    transform: sinon.match.instanceOf(Function),
                    useAnswer: 'name'
                }
            ]));

            test.ok(transform('here-it-is'), 'DashToCapDirective');

            test.end(1);
        });
    });

    suite.test('should generate a list of templates', (test) => {
        const answers = [
            {
                answer: 'burger-blitz',
                name: 'name'
            },
            {
                answer: 'burgerBlitz',
                name: 'selector'
            },
            {
                answer: 'BurgerBlitzDirective',
                name: 'className'
            }
        ];
        const colorize = sandbox.stub(utilities.colorize, 'colorize');
        const dirname = [process.cwd(), 'commands', 'directive'].join(path.sep);
        test.plan(5);

        colorize.callsFake((text, color) =>
            `[${ color }]${ text }[/${ color }]`
        );
        inquire.resetBehavior();
        inquire.resolves(answers);

        make().then(() => {
            test.ok(getTemplates.calledWith(
                '/root/',
                dirname,
                [
                    {
                        destination: '/created/src/directives/{{ name }}.directive.ts',
                        name: 'app.ts'
                    },
                    {
                        destination: '/created/src/directives/{{ name }}.directive.spec.ts',
                        name: 'test.ts'
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
                `    import { BurgerBlitzDirective } from './directives/burger-blitz.directive';`
            ));
            test.ok(log.thirdCall.calledWith(
                '[green]And to add[/green]',
                'BurgerBlitzDirective',
                '[green]to the NgModule declarations list[/green]'
            ));

            test.end();
        });
    });

    suite.test('should generate a list of templates for an examples target', (test) => {
        const answers = [
            {
                answer: 'burger-blitz',
                name: 'name'
            },
            {
                answer: 'burgerBlitz',
                name: 'selector'
            },
            {
                answer: 'BurgerBlitzDirective',
                name: 'className'
            }
        ];
        const colorize = sandbox.stub(utilities.colorize, 'colorize');
        const dirname = [process.cwd(), 'commands', 'directive'].join(path.sep);
        test.plan(5);

        checkForExamples.returns(true);
        colorize.callsFake((text, color) =>
            `[${ color }]${ text }[/${ color }]`
        );
        inquire.resetBehavior();
        inquire.resolves(answers);

        make().then(() => {
            test.ok(getTemplates.calledWith(
                '/root/',
                dirname,
                [
                    {
                        destination: '/created/examples/directives/{{ name }}.directive.ts',
                        name: 'app.ts'
                    },
                    {
                        destination: '/created/examples/directives/{{ name }}.directive.spec.ts',
                        name: 'test.ts'
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
                `    import { BurgerBlitzDirective } from './directives/burger-blitz.directive';`
            ));
            test.ok(log.thirdCall.calledWith(
                '[green]And to add[/green]',
                'BurgerBlitzDirective',
                '[green]to the NgModule declarations list[/green]'
            ));

            test.end();
        });
    });

    suite.end();
});