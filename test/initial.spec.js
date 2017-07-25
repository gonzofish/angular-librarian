'use strict';

const childProcess = require('child_process');
const erector = require('erector-set');
const path = require('path');
const process = require('process');
const sinon = require('sinon');
const tap = require('tap');

const initial = require('../commands/initial');
const logger = require('../commands/logging');
const utilities = require('../tools/utilities');

const caseConvert = utilities.caseConvert;
const files = utilities.files;
const inputs = utilities.inputs;
const opts = utilities.options;

const sandbox = sinon.sandbox.create();

tap.test('initial', (suite) => {
    let chdir;
    let execSync;
    let filesInclude;
    let getTemplates;
    let mockErector;
    let mockLog;
    let mockLogger;
    let resolverCreate;
    let resolverRoot;

    suite.beforeEach((done) => {
        chdir = sandbox.stub(process, 'chdir');
        execSync = sandbox.stub(childProcess, 'execSync');
        filesInclude = sandbox.stub(files, 'include');
        getTemplates = sandbox.stub(files, 'getTemplates');
        mockLog = sandbox.spy();
        mockLogger = sandbox.stub(logger, 'create');
        resolverCreate = sandbox.stub(files.resolver, 'create');
        resolverRoot = sandbox.stub(files.resolver, 'root');

        filesInclude.callsFake((file) => {
            if (file.indexOf('package.json') !== -1) {
                return { name: 'fake-library' };
            }
        });
        mockErector = {
            construct: sandbox.stub(erector, 'construct'),
            inquire: sandbox.stub(erector, 'inquire')
        };
        mockLogger.returns({
            info: mockLog,
            error: mockLog
        });
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

    suite.test('should call erector.inquire with the questions to ask', (test) => {
        const createYesNo = sandbox.stub(inputs, 'createYesNoValue');

        test.plan(22);

        mockErector.inquire.rejects();
        createYesNo.returns('"no" function');

        initial('./').then(() => {
            const questions = mockErector.inquire.lastCall.args[0];
            let transform;

            // Is there a more concise way to do this with sinon & TAP?
            // Maybe use something like jasmine.any(Function)?
            test.equal(questions[0].defaultAnswer, 'fake-library');
            test.equal(questions[0].name, 'name');
            test.equal(questions[0].question, 'Library name:');
            test.equal(typeof questions[0].transform, 'function');

            test.equal(questions[1].name, 'packageName');
            test.equal(typeof questions[1].transform, 'function');
            test.equal(questions[1].useAnswer, 'name');

            test.equal(typeof questions[2].defaultAnswer, 'function');
            test.equal(questions[2].name, 'readmeTitle');
            test.equal(questions[2].question, 'README Title:');

            test.equal(questions[3].name, 'repoUrl');
            test.equal(questions[3].question, 'Repository URL:');

            test.equal(questions[4].name, 'git');
            test.equal(questions[4].question, 'Reinitialize Git project (y/N)?');
            test.ok(createYesNo.calledWith('n'));
            test.equal(questions[4].transform, '"no" function');

            test.equal(questions[5].name, 'moduleName');
            test.equal(typeof questions[5].transform, 'function');
            test.equal(questions[5].useAnswer, 'packageName');

            test.equal(questions[6].name, 'version');
            test.equal(questions[6].question, 'Version:');

            test.ok(mockLog.calledWith('\x1b[31mError\x1b[0m'));

            test.end();
        });
    });

    suite.test('should have a name question transform that tests for proper format', (test) => {
        test.plan(16);

        mockErector.inquire.rejects();

        initial('./').then(() => {
            const { transform } = mockErector.inquire.lastCall.args[0][0];

            test.equal(transform(), '');
            test.equal(transform(123), null);
            test.equal(transform('a'.repeat(215)), null);
            test.equal(transform(' a   '), null);
            test.equal(transform('A'), null);
            test.equal(transform('.a'), null);
            test.equal(transform('_a'), null);
            test.equal(transform('-a'), null);
            test.equal(transform('a.'), null);
            test.equal(transform('a_'), null);
            test.equal(transform('a-'), null);
            test.equal(transform('@scope/package/nope'), null);
            test.equal(transform('package/nope'), null);
            test.equal(transform('$houlnt-work'), null);
            test.equal(transform('@scope/package'), '@scope/package');
            test.equal(transform('package-name12'), 'package-name12');

            test.end();
        });
    });

    suite.test('should have a packageName question transform that extracts the package name without a scope', (test) => {
        test.plan(2);

        mockErector.inquire.rejects();

        initial('./').then(() => {
            const { transform } = mockErector.inquire.lastCall.args[0][1];

            test.equal(transform('@myscope/package-name'), 'package-name');
            test.equal(transform('my-package'), 'my-package');

            test.end();
        });
    });

    suite.test('should have a moduleName question transform that converts the packageName using caseConvert.dashToCap and adds a "Module" suffix', (test) => {
        const dashToCap = sandbox.stub(caseConvert, 'dashToCap');

        test.plan(1);

        mockErector.inquire.rejects();
        dashToCap.returns('WOW!');

        initial('./').then(() => {
            const { transform } = mockErector.inquire.lastCall.args[0][5];
            test.equal(transform('this is calm'), 'WOW!Module');
            test.end();
        });
    });

    suite.test('should parse command-line options', (test) => {
        test.plan(1);

        const parseOptions = sandbox.stub(opts, 'parseOptions');

        mockErector.inquire.resolves([{ name: 'git' }]);
        parseOptions.returns({});

        initial('./', 'pizza', 'eat', 'yum').then(() => {
            test.ok(parseOptions.calledWith(['pizza', 'eat', 'yum'], ['no-install', 'ni']));
            test.end();
        });
    });

    suite.test('should call files.getTemplates with the rootDir, command dir, & the list of templates', (test) => {
        const dirname = process.cwd() + path.sep + ['commands', 'initial'].join(path.sep);

        getTemplates.returns([]);
        mockErector.inquire.resolves([{ name: 'git' }]);

        test.plan(1);

        initial('./').then(() => {
            const templateList = getTemplates.lastCall.args[2];

            test.ok(getTemplates.calledWith('./', dirname, [
                { destination: '/root/.gitignore', name: '__gitignore' },
                { destination: '/root/.npmignore', name: '__npmignore' },
                { name: 'DEVELOPMENT.md' },
                { blank: true, name: 'examples/example.component.html' },
                { blank: true, name: 'examples/example.component.scss' },
                { name: 'examples/example.component.ts' },
                { name: 'examples/example.main.ts' },
                { name: 'examples/example.module.ts' },
                { name: 'examples/index.html' },
                { blank: true, name: 'examples/styles.scss' },
                { name: 'index.ts' },
                { name: 'karma.conf.js', overwrite: true },
                { destination: '/created/src/{{ packageName }}.module.ts', name: 'src/module.ts' },
                { name: 'package.json', update: 'json' },
                { name: 'README.md' },
                { destination: '/created/src/index.ts', name: 'src/index.ts' },
                { destination: '/created/src/test.js', name: 'src/test.js', overwrite: true },
                { name: 'tsconfig.json', overwrite: true },
                { name: 'tsconfig.es2015.json', overwrite: true },
                { name: 'tsconfig.es5.json', overwrite: true },
                { name: 'tsconfig.test.json', overwrite: true },
                { name: 'tslint.json', overwrite: true },
                { destination: '/created/src/vendor.ts', name: 'src/vendor.ts' },
                { name: 'tasks/build.js', overwrite: true },
                { name: 'tasks/copy-build.js', overwrite: true },
                { name: 'tasks/copy-globs.js', overwrite: true },
                { name: 'tasks/inline-resources.js', overwrite: true },
                { name: 'tasks/rollup.js', overwrite: true },
                { name: 'tasks/test.js', overwrite: true },
                { name: 'webpack/webpack.common.js', overwrite: true },
                { name: 'webpack/webpack.dev.js', overwrite: true },
                { name: 'webpack/webpack.test.js', overwrite: true },
                { name: 'webpack/webpack.utils.js', overwrite: true }
            ]));

            test.end();
        });
    });

    suite.test('should call erector.construct with the user\'s answers & the templates from files.getTemplates', (test) => {
        const answers = [
            { answer: '@myscope/fake-library', name: 'name' },
            { answer: 'fake-library', name: 'packageName' },
            { answer: 'Fake Library', name: 'readmeTitle' },
            { answer: 'http://re.po', name: 'repoUrl' },
            { answer: false, name: 'git' },
            { answer: 'FakeLibraryModule', name: 'moduleName' },
            { answer: '1.0.0', name: 'version' }
        ];
        const dirname = process.cwd() + path.sep + ['commands', 'initial'].join(path.sep);
        const templates = [
            { destination: '/root/path', template: 'some/template/path' },
            { desetination: '/root/blank-file', template: undefined }
        ];

        test.plan(4);

        getTemplates.returns(templates);
        mockErector.inquire.resolves(answers);

        initial('./').then(() => {
            // quick check that chdir is being called
            test.ok(chdir.calledTwice);
            test.ok(chdir.calledWith('./'));
            test.ok(chdir.calledWith(dirname));

            test.ok(mockErector.construct.calledWith(answers, templates));
            test.end();
        });
    });

    suite.test('should install NPM modules if the "no install" flag is NOT present', (test) => {
        const answers = [
            { answer: '@myscope/fake-library', name: 'name' },
            { answer: 'fake-library', name: 'packageName' },
            { answer: 'Fake Library', name: 'readmeTitle' },
            { answer: 'http://re.po', name: 'repoUrl' },
            { answer: false, name: 'git' },
            { answer: 'FakeLibraryModule', name: 'moduleName' },
            { answer: '1.0.0', name: 'version' }
        ];
        const dirname = process.cwd() + path.sep + ['commands', 'initial'].join(path.sep);
        const templates = [
            { destination: '/root/path', template: 'some/template/path' },
            { desetination: '/root/blank-file', template: undefined }
        ];

        test.plan(3);

        getTemplates.returns(templates);
        mockErector.inquire.resolves(answers);

        initial('./').then(() => {
            test.ok(mockLog.calledWith('\x1b[36mInstalling Node modules\x1b[0m'));
            test.ok(execSync.calledWith(
                'npm i',
                { stdio: [0, 1, 2] }
            ));
            test.ok(mockLog.calledWith('\x1b[32mNode modules installed\x1b[0m'));

            test.end();
        });
    });

    suite.test('should initialize a Git project if the user answers yes to the Git question', (test) => {
        const answers = [
            { answer: '@myscope/fake-library', name: 'name' },
            { answer: 'fake-library', name: 'packageName' },
            { answer: 'Fake Library', name: 'readmeTitle' },
            { answer: 'http://re.po', name: 'repoUrl' },
            { answer: true, name: 'git' },
            { answer: 'FakeLibraryModule', name: 'moduleName' },
            { answer: '1.0.0', name: 'version' }
        ];
        const dirname = process.cwd() + path.sep + ['commands', 'initial'].join(path.sep);
        const templates = [
            { destination: '/root/path', template: 'some/template/path' },
            { desetination: '/root/blank-file', template: undefined }
        ];
        const del = sandbox.stub(files, 'deleteFolder');

        test.plan(6);

        getTemplates.returns(templates);
        mockErector.inquire.resolves(answers);

        // also tests --no-install flag
        initial('./', '--no-install').then(() => {
            test.ok(mockLog.calledWith('\x1b[33mRemoving existing Git project\x1b[0m'));
            test.ok(del.calledWith('/root/.git'));
            test.ok(mockLog.calledWith('\x1b[36mInitializing new Git project\x1b[0m'));
            test.ok(execSync.calledWith(
                'git init',
                { stdio: [0, 1, 2] }
            ));
            test.notOk(execSync.calledWith(
                'npm i',
                { stdio: [0, 1, 2] }
            ));
            test.ok(mockLog.calledWith('\x1b[32mGit project initialized\x1b[0m'));
            test.end();
        });
    });

    suite.end();
});
