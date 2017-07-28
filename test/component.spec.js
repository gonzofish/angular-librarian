'use strict';

const erector = require('erector-set');
const path = require('path');
const sinon = require('sinon');
const tap = require('tap');

const component = require('../commands/component');
const logging = require('../commands/logging');
const utilities = require('../commands/utilities');

const caseConvert = utilities.caseConvert;
const colorize = utilities.colorize;
const files = utilities.files;
const inputs = utilities.inputs;
const make = (...args) => component.apply(null, ['./'].concat(Array.from(args)));
const opts = utilities.options;
const sandbox = sinon.sandbox.create();

tap.test('command: component', (suite) => {
    let color;
    let construct;
    let createYesNo;
    let inquire;
    let log;
    let mockLogger;
    let parseOptions;
    let resolverCreate;
    let resolverRoot;

    suite.beforeEach((done) => {
        color = sandbox.stub(colorize, 'colorize');
        construct = sandbox.stub(erector, 'construct');
        createYesNo = sandbox.stub(inputs, 'createYesNoValue');
        inquire = sandbox.stub(erector, 'inquire');
        log = sandbox.spy();
        mockLogger = sandbox.stub(logging, 'create');
        parseOptions = sandbox.stub(opts, 'parseOptions');
        resolverCreate = sandbox.stub(files.resolver, 'create');
        resolverRoot = sandbox.stub(files.resolver, 'root');

        color.callsFake((text, color) => `[${ color }]${ text }[/${ color }]`);
        mockLogger.returns({
            error: log,
            info: log,
            log,
            warning: log
        });
        parseOptions.returns({});
        resolverCreate.callsFake(function() {
            const createPath = Array.from(arguments).join('/');
            return function() {
                return `/created/${ createPath }/` + Array.from(arguments).join('/');
            };
        });
        resolverRoot.callsFake(function() {
            return '/root/' + Array.from(arguments).join('/');
        });

        done();
    });

    suite.afterEach((done) => {
        sandbox.restore();
        done();
    });

    suite.test('should parse options via opts.parseOptions', (test) => {
        test.plan(1);
        inquire.rejects();

        make('--a', 'big', 'deal').catch(() => {
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

        make('selector', '--yep', '-ise').catch(() => {
            test.deepEqual(parseOptions.lastCall.args[0], ['--yep', '-ise']);
            test.end();
        });
    });

    suite.test('should return an error if inquire fails', (test) => {
        test.plan(1);

        inquire.rejects();
        make().catch((error) => {
            test.ok(error, `Error`);
            test.end();
        });
    });
    
    suite.test('should throw an error --default and no selector', (test) => {
        parseOptions.resetBehavior();
        parseOptions.returns({ default: [] });
        test.plan(1);

        // --default doesnt matter here because parseOptions is mocked
        make('--default').catch((error) => {
            test.equal(error, 'A dash-case selector must be provided when using defaults');
            test.end();
        });
    });

    suite.test('should throw an error --default and a non-dash-case selector', (test) => {
        parseOptions.resetBehavior();
        parseOptions.returns({ default: [] });
        test.plan(1);

        // --default doesnt matter here because parseOptions is mocked
        make('oops!', '--default').catch((error) => {
            test.equal(error, 'A dash-case selector must be provided when using defaults');
            test.end();
        });
    });

    suite.test('should ask no questions with --default and a selector', (test) => {
        parseOptions.resetBehavior();
        parseOptions.returns({ default: [] });
        test.plan(2);

        // --default doesnt matter here because parseOptions is mocked
        make('my-selector', '--default').then(() => {
            test.ok(inquire.notCalled);
            test.ok(construct.calledWith([
                { answer: 'my-selector', name: 'selector' },
                { answer: 'MySelectorComponent', name: 'componentName' },
                { answer: `'./my-selector.component.scss'`, name: 'styles' },
                { answer: 'styleUrls', name: 'styleAttribute' },
                { answer: `'./my-selector.component.html'`, name: 'template' },
                { answer: 'templateUrl', name: 'templateAttribute' },
                { answer: '' , name: 'hooks' },
                { answer: '', name: 'implements' },
                { answer: '\n', name: 'lifecycleNg' }
            ]));
            test.end();
        });
    });

    suite.test('should ask no questions with --defaults and a selector', (test) => {
        parseOptions.resetBehavior();
        parseOptions.returns({ defaults: [] });
        test.plan(2);

        // --default doesnt matter here because parseOptions is mocked
        make('my-selector', '--defaults').then(() => {
            test.ok(inquire.notCalled);
            test.ok(construct.calledWith([
                { answer: 'my-selector', name: 'selector' },
                { answer: 'MySelectorComponent', name: 'componentName' },
                { answer: `'./my-selector.component.scss'`, name: 'styles' },
                { answer: 'styleUrls', name: 'styleAttribute' },
                { answer: `'./my-selector.component.html'`, name: 'template' },
                { answer: 'templateUrl', name: 'templateAttribute' },
                { answer: '' , name: 'hooks' },
                { answer: '', name: 'implements' },
                { answer: '\n', name: 'lifecycleNg' }
            ]));
            test.end();
        });
    });

    suite.test('should ask no questions with -d and a selector', (test) => {
        parseOptions.resetBehavior();
        parseOptions.returns({ d: [] });
        test.plan(2);

        // --default doesnt matter here because parseOptions is mocked
        make('my-selector', '-d').then(() => {
            test.ok(inquire.notCalled);
            test.ok(construct.calledWith([
                { answer: 'my-selector', name: 'selector' },
                { answer: 'MySelectorComponent', name: 'componentName' },
                { answer: `'./my-selector.component.scss'`, name: 'styles' },
                { answer: 'styleUrls', name: 'styleAttribute' },
                { answer: `'./my-selector.component.html'`, name: 'template' },
                { answer: 'templateUrl', name: 'templateAttribute' },
                { answer: '' , name: 'hooks' },
                { answer: '', name: 'implements' },
                { answer: '\n', name: 'lifecycleNg' }
            ]));
            test.end();
        });
    });

    suite.test('should ask all questions if no flags are set and no selector is provided', (test) => {
        test.plan(32);

        createYesNo.returns('"no" function');
        inquire.rejects();
        make().catch(() => {
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
            test.equal(question.transform, '"no" function');
            test.ok(createYesNo.calledWith(
                'n',
                [],
                sinon.match.instanceOf(Function)
            ));

            question = questions[3];
            test.equal(question.name, 'styleAttribute');
            test.equal(typeof question.transform, 'function');
            test.equal(question.useAnswer, 'styles');

            // template
            question = questions[4];
            test.equal(question.allowBlank, true);
            test.equal(question.name, 'template');
            test.equal(question.question, 'Use inline template (y/N)?');
            test.equal(question.transform, '"no" function');
            test.ok(createYesNo.calledWith(
                'n',
                [],
                sinon.match.instanceOf(Function)
            ));

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

    suite.test('should NOT ask the lifecycle hooks question if provided as a --hooks argument', (test) => {
        test.plan(2);

        parseOptions.resetBehavior();
        parseOptions.returns({ hooks: ['init', 'check'] });
        inquire.rejects();
        make('--hooks', 'init,check').catch(() => {
            const questions = inquire.lastCall.args[0];

            test.equal(questions.length, 6);
            test.notOk(questions.find((question) =>
                question.name === 'hooks' ||
                question.name === 'implements' ||
                question.name === 'lifecycleNg'
            ));

            test.end();
        });
    });

    suite.test('should NOT ask the lifecycle hooks question if provided as a --h argument', (test) => {
        test.plan(2);

        parseOptions.resetBehavior();
        parseOptions.returns({ h: ['init', 'check'] });
        inquire.rejects();
        make('--h', 'init', 'check').catch(() => {
            const questions = inquire.lastCall.args[0];

            test.equal(questions.length, 6);
            test.notOk(questions.find((question) =>
                question.name === 'hooks' ||
                question.name === 'implements' ||
                question.name === 'lifecycleNg'
            ));

            test.end();
        });
    });

    suite.test('should ask the lifecycle hooks question if provided a --hooks or --h argument with NO values', (test) => {
        test.plan(2);

        parseOptions.resetBehavior();
        parseOptions.returns({ h: []});
        inquire.rejects();
        make('--h').catch(() => {
            const questions = inquire.lastCall.args[0];

            test.equal(questions.length, 9);
            test.ok(questions.find((question) =>
                question.name === 'hooks' ||
                question.name === 'implements' ||
                question.name === 'lifecycleNg'
            ));

            test.end();
        });
    });

    suite.test('should NOT ask the inline-styles question if --inline-styles is provided', (test) => {
        test.plan(2);

        parseOptions.resetBehavior();
        parseOptions.returns({ 'inline-styles': []});
        inquire.rejects();
        make('--inline-styles').catch(() => {
            const questions = inquire.lastCall.args[0];

            test.equal(questions.length, 7);
            test.notOk(questions.find((question) =>
                question.name === 'styles' ||
                question.name === 'styleAttribute'
            ));

            test.end();
        });
    });

    suite.test('should NOT ask the inline-styles question if --is is provided', (test) => {
        test.plan(2);

        parseOptions.resetBehavior();
        parseOptions.returns({ is: []});
        inquire.rejects();
        make('--is').catch(() => {
            const questions = inquire.lastCall.args[0];

            test.equal(questions.length, 7);
            test.notOk(questions.find((question) =>
                question.name === 'styles' ||
                question.name === 'styleAttribute'
            ));

            test.end();
        });
    });

    suite.test('should NOT ask the inline-template question if --inline-template is provided', (test) => {
        test.plan(2);

        parseOptions.resetBehavior();
        parseOptions.returns({ 'inline-template': []});
        inquire.rejects();
        make('--inline-template').catch(() => {
            const questions = inquire.lastCall.args[0];

            test.equal(questions.length, 7);
            test.notOk(questions.find((question) =>
                question.name === 'template' ||
                question.name === 'templateAttribute'
            ));

            test.end();
        });
    });

    suite.test('should NOT ask the inline-template question if --it is provided', (test) => {
        test.plan(2);

        parseOptions.resetBehavior();
        parseOptions.returns({ it: []});
        inquire.rejects();
        make('--it').catch(() => {
            const questions = inquire.lastCall.args[0];

            test.equal(questions.length, 7);
            test.notOk(questions.find((question) =>
                question.name === 'template' ||
                question.name === 'templateAttribute'
            ));

            test.end();
        });
    });

    suite.test('should have a selector transform that returns the value if it is dash format, null otherwise', (test) => {
        const checkDash = sandbox.stub(caseConvert, 'checkIsDashFormat');

        test.plan(2);

        inquire.rejects();
        make().catch(() => {
            const questions = inquire.lastCall.args[0];
            const transform = questions[0].transform;

            checkDash.returns(false);
            test.equal(transform('value'), null);

            checkDash.resetBehavior();
            checkDash.returns(true);
            test.equal(transform('value'), 'value');

            test.end();
        });
    });

    suite.test('should have a componentName transform that return the Pascal-case of the selector + Component', (test) => {
        const dashToCap = sandbox.stub(caseConvert, 'dashToCap');

        test.plan(1);

        inquire.rejects();
        make().catch(() => {
            const questions = inquire.lastCall.args[0];
            const transform = questions[1].transform;

            dashToCap.returns('CapVersion');
            test.equal(transform('cap-version'), 'CapVersionComponent');

            test.end();
        });
    });

    suite.test('should have a styles transform callback that sets inline styles', (test) => {
        test.plan(3);

        inquire.rejects();
        make().catch(() => {
            const callback = createYesNo.firstCall.args[2];
            const answers = [ { answer: 'burger-bonanza', name: 'selector'}];

            test.equal(callback(true, answers), '``');
            test.equal(callback('', answers),  `'./burger-bonanza.component.scss'`);
            test.equal(callback(false, answers), `'./burger-bonanza.component.scss'`);

            test.end();
        });
    });

    suite.test('should have a styleAttribute transform that picks the template attribute', (test) => {
        test.plan(2);

        inquire.rejects();
        make().catch(() => {
            const questions = inquire.lastCall.args[0]
            const { transform } = questions[3];

            test.equal(transform('some value'), 'styleUrls');
            test.equal(transform('``'), 'styles');
            test.end();
        });
    });

    suite.test('should have a templates transform callback that sets inline templates', (test) => {
        test.plan(3);

        inquire.rejects();
        make().catch(() => {
            const callback = createYesNo.lastCall.args[2];
            const answers = [ { answer: 'pizza-party', name: 'selector'}];

            test.equal(callback(true, answers), '``');
            test.equal(callback('', answers),  `'./pizza-party.component.html'`);
            test.equal(callback(false, answers), `'./pizza-party.component.html'`);

            test.end();
        });
    });

    suite.test('should have a templateAttribute transform that picks the template attribute', (test) => {
        test.plan(2);

        inquire.rejects();
        make().catch(() => {
            const questions = inquire.lastCall.args[0];
            const { transform } = questions[5];

            test.equal(transform('some value'), 'templateUrl');
            test.equal(transform('``'), 'template');
            test.end();
        });
    });

    suite.test('should have a hooks transform that sets the lifecycle hooks', (test) => {
        test.plan(2);

        inquire.rejects();
        make().catch(() => {
            const questions = inquire.lastCall.args[0];
            const { transform } = questions[6];

            test.equal(transform('init,oninit,changes,onchanges,check,oncheck,ondestroy,destroy'), ', OnInit, OnChanges, DoCheck, OnDestroy');
            test.equal(transform(''), '');
            test.end();
        });
    });

    suite.test('should have an implements transform that sets the lifecycle implements', (test) => {
        test.plan(2);

        inquire.rejects();
        make().catch(() => {
            const questions = inquire.lastCall.args[0];
            const { transform } = questions[7];

            test.equal(transform(', DoCheck, OnDestroy'), ' implements DoCheck, OnDestroy');
            test.equal(transform(''), '');
            test.end();
        });
    });

    suite.test('should have a lifecycleNg transform that sets up the lifecycle methods', (test) => {
        test.plan(2);

        inquire.rejects();
        make().catch(() => {
            const questions = inquire.lastCall.args[0];
            const { transform } = questions[8];
            const result = '\n' +
                '\n    ngOnInit() {\n    }\n' +
                '\n    ngOnChanges() {\n    }\n' +
                '\n    ngOnDestroy() {\n    }\n';

            test.equal(transform(', OnInit, OnChanges, OnDestroy'), result);
            test.equal(transform(''), '\n');
            test.end();
        });
    });

    suite.test('should call files.getTemplates to create the template directory', (test) => {
        const answers = [
            { answer: 'taco-time', name: 'selector' },
            { answer: 'TacoTimeComponent', name: 'componentName' },
            { answer: '``', name: 'styles' },
            { answer: 'styles', name: 'styleAttribute' },
            { answer: '``', name: 'template' },
            { answer: 'template', name: 'templateAttribute' },
            { answer: '', name: 'hooks' },
            { answer: '', name: 'implements' },
            { answer: '\n', name: 'lifecycleNg' }
        ];
        const dirname = [process.cwd(), 'commands', 'component'].join(path.sep);
        const getTemplates = sandbox.stub(files, 'getTemplates');
        test.plan(1);

        getTemplates.returns([{ file: 'da.html' }]);
        inquire.resolves(answers);
        make().then(() => {
            test.ok(getTemplates.calledWith(
                '/root/',
                dirname,
                [
                    {
                        destination: '/created/src/{{ selector }}/{{ selector }}.component.ts',
                        name: 'app.ts'
                    },
                    {
                        destination: '/created/src/{{ selector }}/{{ selector }}.component.spec.ts',
                        name: 'spec.ts'
                    },
                    {
                        blank: true,
                        check: sinon.match.instanceOf(Function),
                        destination: '/created/src/{{ selector }}/{{ selector }}.component.scss'
                    },
                    {
                        blank: true,
                        check: sinon.match.instanceOf(Function),
                        destination: '/created/src/{{ selector }}/{{ selector }}.component.html'
                    }
                ]
            ));
            test.end();
        });
    });

    suite.test('should check if the scaffolding is for examples', (test) => {
        const answers = [
            { answer: 'taco-time', name: 'selector' },
            { answer: 'TacoTimeComponent', name: 'componentName' },
            { answer: '``', name: 'styles' },
            { answer: 'styles', name: 'styleAttribute' },
            { answer: '``', name: 'template' },
            { answer: 'template', name: 'templateAttribute' },
            { answer: '', name: 'hooks' },
            { answer: '', name: 'implements' },
            { answer: '\n', name: 'lifecycleNg' }
        ];
        const checkForExamples = sandbox.stub(opts, 'checkIsForExamples');
        const dirname = [process.cwd(), 'commands', 'component'].join(path.sep);
        const getTemplates = sandbox.stub(files, 'getTemplates');
        const options = { pizza: [] };
        
        test.plan(2);

        checkForExamples.returns(true);
        getTemplates.returns([{ file: 'da.html' }]);
        inquire.resolves(answers);
        parseOptions.resetBehavior();
        parseOptions.returns(options);

        make().then(() => {
            test.ok(checkForExamples.calledWith(options));
            test.ok(getTemplates.calledWith(
                '/root/',
                dirname,
                [
                    {
                        destination: '/created/examples/{{ selector }}/{{ selector }}.component.ts',
                        name: 'app.ts'
                    },
                    {
                        destination: '/created/examples/{{ selector }}/{{ selector }}.component.spec.ts',
                        name: 'spec.ts'
                    },
                    {
                        blank: true,
                        check: sinon.match.instanceOf(Function),
                        destination: '/created/examples/{{ selector }}/{{ selector }}.component.scss'
                    },
                    {
                        blank: true,
                        check: sinon.match.instanceOf(Function),
                        destination: '/created/examples/{{ selector }}/{{ selector }}.component.html'
                    }
                ]
            ));
            test.end();
        });
    });

    suite.test('should have a SCSS template check which returns true when the styles answer is ``', (test) => {
        test.plan(2);

        const answers = [
            { answer: 'taco-time', name: 'selector' },
            { answer: 'TacoTimeComponent', name: 'componentName' },
            { answer: '``', name: 'styles' },
            { answer: 'styles', name: 'styleAttribute' },
            { answer: '``', name: 'template' },
            { answer: 'template', name: 'templateAttribute' },
            { answer: '', name: 'hooks' },
            { answer: '', name: 'implements' },
            { answer: '\n', name: 'lifecycleNg' }
        ];
        const dirname = [process.cwd(), 'commands', 'component'].join(path.sep);
        const getTemplates = sandbox.stub(files, 'getTemplates');

        getTemplates.returns([{ file: 'da.html' }]);
        inquire.resolves(answers);
        make().then(() => {
            const template = getTemplates.lastCall.args[2][2];

            test.notOk(template.check(answers));
            answers[2].answer = `'./taco-time.component.scss'`;
            test.ok(template.check(answers));

            test.end();
        });
    });

    suite.test('should have a HTML template check which returns true when the template answer is ``', (test) => {
        test.plan(2);

        const answers = [
            { answer: 'taco-time', name: 'selector' },
            { answer: 'TacoTimeComponent', name: 'componentName' },
            { answer: '``', name: 'styles' },
            { answer: 'styles', name: 'styleAttribute' },
            { answer: '``', name: 'template' },
            { answer: 'template', name: 'templateAttribute' },
            { answer: '', name: 'hooks' },
            { answer: '', name: 'implements' },
            { answer: '\n', name: 'lifecycleNg' }
        ];
        const dirname = [process.cwd(), 'commands', 'component'].join(path.sep);
        const getTemplates = sandbox.stub(files, 'getTemplates');

        getTemplates.returns([{ file: 'da.html' }]);
        inquire.resolves(answers);
        make().then(() => {
            const template = getTemplates.lastCall.args[2][3];

            test.notOk(template.check(answers));
            answers[4].answer = `'./taco-time.component.html'`;
            test.ok(template.check(answers));

            test.end();
        });
    });

    // test output message

    suite.end();
});
