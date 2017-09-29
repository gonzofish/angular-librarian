/*

1. check librarian version
2. install?
3. inquire w/ do you want to proceed?
4. Cancelled
5. Update files

*/
'use strict';

const erector = require('erector-set');
const path = require('path');
const semver = require('semver');
const sinon = require('sinon');
const tap = require('tap');

const ex = require('../tools/utilities/execute');
const up = require('../commands/upgrade');
const testUtils = require('./test-utils');

const sandbox = sinon.sandbox.create();
const mockOnce = (util, method) => testUtils.mockOnce(sandbox, util, method);
const npm = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';


tap.test('command: upgrade', (suite) => {
    let getVersion;
    let gt;
    let make;
    let mocks;
    let execute;

    suite.beforeEach((done) => {
        gt = sandbox.stub(semver, 'gt');
        make = testUtils.makeMake(up);
        mocks = testUtils.mock(sandbox);
        execute = sandbox.stub(ex, 'execute');

        execute.callsFake((cmd, args) => {
            switch (args[0]) {
                case 'list':
                    return 'angular-librarian@300.0.0';
                case 'show':
                    return '300.0.1';
                default:
                    return '';
            }
        });
        gt.returns(false);

        done();
    });

    suite.afterEach((done) => {
        sandbox.restore();
        done();
    });

    suite.test('should create a Upgrade logger', (test) => {
        test.plan(1);

        make().catch(() => {
            test.ok(mocks.logger.calledWith('Upgrade'));
            test.end();
        });
    });

    suite.test('should throw an error if no librarian version is installed when checking versions', (test) => {
        test.plan(1);

        execute.resetBehavior();
        execute.callsFake((cmd, args) => {
            switch (args[0]) {
                case 'show':
                    return 'angular-librarian@300.0.1';
                default:
                    return '';
            }
        });

        make().catch((error) => {
            test.equal(error, 'Angular Librarian is not installed. Not sure how that\'s possible!\n\n\tRun `npm i -D angular-librarian` to install');
            test.end();
        });
    });

    suite.test('should check for if librarian needs to be upgraded', (test) => {
        const { log } = mocks;
        test.plan(6);

        make().catch(() => {
            test.ok(log.firstCall.calledWith('[cyan]Identifying the *newest* angular-librarian version[/cyan]'));
            test.ok(execute.firstCall.calledWith(
                npm,
                ['show', 'angular-librarian', 'version']
            ));
            test.ok(log.secondCall.calledWith('[blue]Identifying the *installed* angular-librarian version[/blue]'));
            test.ok(execute.secondCall.calledWith(
                npm,
                ['list', '--depth=0', 'angular-librarian']
            ));
            test.ok(gt.calledWith('300.0.1', '300.0.0'));
            test.ok(log.thirdCall.calledWith(
                '[yellow]\tUpgrade of angular-librarian is[/yellow]',
                '[red]NOT[/red]',
                '[yellow]required.[/yellow]'
            ));

            test.end();
        });
    });

    suite.test('should install librarian if there is a newer version available', (test) => {
        const { log } = mocks;

        gt.resetBehavior();
        gt.returns(true);
        test.plan(2);

        make().catch(() => {
            test.ok(log.getCall(3).calledWith(
                '[green]    Installing angular-librarian@300.0.1[/green]'
            ));
            test.ok(execute.thirdCall.calledWith(
                npm,
                ['i', '-D', 'angular-librarian@300.0.1']
            ));
            test.end();
        });
    });

    suite.test('should upgrade the branch version if specified in the project package.json', (test) => {
        const { checkVersion, log } = mocks;

        checkVersion.resetBehavior();
        checkVersion.returns(true);

        test.plan(3);

        make().catch(() => {
            test.ok(log.calledWith('[green]Upgrading angular-librarian from:[/green]'));
            test.ok(log.calledWith('[magenta]    ice-cream[/magenta]'));
            test.ok(execute.calledWith(
                npm,
                ['up', 'angular-librarian']
            ));
            test.end();
        });
    });

    suite.test('should call erector.inquire with a confirm file upgrade question', (test) => {
        const { inquire } = mocks.erector;
        const createYesNo = mockOnce('inputs', 'createYesNoValue');

        createYesNo.returns('yes-no');
        test.plan(2);

        make().catch(() => {
            test.ok(inquire.calledWith([
                {
                    allowBlank: true,
                    name: 'proceed',
                    question: 'The following will overwrite some of the files in your project. Would you like to continue (y/N)?',
                    transform: 'yes-no'
                }
            ]));
            test.ok(createYesNo.calledWith('n', []));
            test.end();
        });
    });

    suite.test('should cancel the file upgrade when the user answers no', (test) => {
        const { construct, inquire } = mocks.erector;
        const { log } = mocks;
        const answers = [
            {
                name: 'proceed',
                answer: false
            }
        ];

        inquire.resetBehavior();
        inquire.resolves(answers);
        test.plan(2);

        make().then(() => {
            test.ok(log.lastCall.calledWith(
                '[yellow]    Upgrade cancelled.[/yellow]'
            ));
            test.notOk(construct.called);
            test.end();
        });
    });

    suite.test('should upgrade the files when the user answers yes', (test) => {
        const { construct, inquire } = mocks.erector;
        const { getTemplates, log } = mocks;
        const answers = [
            {
                name: 'name',
                answer: 'my-package'
            }
        ];
        const finalAnswers = answers.concat(
            {
                name: 'packageName',
                answer: 'my-package'
            },
            {
            name: 'librarianVersion',
            answer: 'ice-cream'
            }
        );
        const inquireAnswers = [
            {
                name: 'proceed',
                answer: true
            }
        ];
        const dirname = [process.cwd(), 'commands', 'upgrade'].join(path.sep);
        const include = mockOnce('files', 'include');
        const open = mockOnce('files', 'open');

        include.returns({
            name: 'my-package'
        });
        open.returns(answers);
        inquire.resetBehavior();
        inquire.resolves(inquireAnswers);
        test.plan(4);

        make().then(() => {
            test.ok(getTemplates.calledWith(
                '/root/',
                `/manual/${ dirname }/../initial`,
                [
                    {
                        destination: '/root/.gitignore',
                        name: '__gitignore',
                        update: sinon.match.instanceOf(Function)
                    },
                    {
                        destination: '/root/.npmignore',
                        name: '__npmignore',
                        update: sinon.match.instanceOf(Function)
                    },
                    { name: 'DEVELOPMENT.md' },
                    { name: 'karma.conf.js', overwrite: true },
                    {
                        name: 'package.json',
                        update: sinon.match.instanceOf(Function)
                    },
                    { name: 'tsconfig.es5.json', overwrite: true },
                    { name: 'tsconfig.es2015.json', overwrite: true },
                    { name: 'tsconfig.json', overwrite: true },
                    { name: 'tsconfig.test.json', overwrite: true },
                    { name: 'tslint.json', overwrite: true },
                    {
                        destination: '/created/src/test.js',
                        name: 'src/test.js', overwrite: true
                    },
                    { name: 'tasks/build.js', overwrite: true },
                    { name: 'tasks/copy-build.js', overwrite: true },
                    { name: 'tasks/copy-globs.js', overwrite: true },
                    { name: 'tasks/inline-resources.js', overwrite: true },
                    { name: 'tasks/rollup.js', overwrite: true },
                    { name: 'tasks/tag-version.js', overwrite: true },
                    { name: 'tasks/test.js', overwrite: true },
                    { name: 'webpack/webpack.common.js', overwrite: true },
                    { name: 'webpack/webpack.dev.js', overwrite: true },
                    { name: 'webpack/webpack.test.js', overwrite: true },
                    { name: 'webpack/webpack.utils.js', overwrite: true }
                ]
            ));
            test.ok(construct.calledWith(finalAnswers, 'fake-templates'));
            test.ok(log.calledWith(
                '[cyan]    Updating managed files to latest versions[/cyan]'
            ));
            test.ok(log.calledWith(
                '[green]Files have been upgraded![/green]'
            ));

            test.end();
        });
    });

    suite.test('should update package.json by merging', (test) => {
        const { getTemplates } = mocks;
        const { inquire } = mocks.erector;
        const answers = [
            {
                name: 'name',
                answer: 'my-package'
            }
        ];
        const inquireAnswers = [
            {
                name: 'proceed',
                answer: true
            }
        ];
        const jsonUpdater = sandbox.stub(erector.updaters, 'json');
        const json = JSON.stringify({
            author: 'Nope',
            fake: 12,
            keywords: [],
            toppings: 'all'
        });
        const existing = JSON.stringify({
            author: 'Chef Angular',
            description: 'A tasty recipe tool',
            es2015: './recipe-rocker.js',
            keywords: ['food', 'angular'],
            license: 'MIT',
            main: './recipe-rocker.bundle.js',
            module: './module.js',
            name: 'Reciper Rocker',
            repository: {
                type: 'git',
                url: 'https://github.com/recipes/rocker.git'
            },
            typings: './toppings.d.ts',
            version: '9.9.9'
        });
        const include = mockOnce('files', 'include');
        const open = mockOnce('files', 'open');

        include.returns({
            name: 'my-package'
        });
        open.returns(answers);
        inquire.resetBehavior();
        inquire.resolves(inquireAnswers);
        jsonUpdater.returns(json);
        test.plan(1);

        make().then(() => {
            const updatePackage = getTemplates.lastCall.args[2][4].update;
            test.equal(updatePackage(existing, ''), JSON.stringify({
                author: 'Chef Angular',
                fake: 12,
                keywords: ['food', 'angular'],
                toppings: 'all',
                description: 'A tasty recipe tool',
                es2015: './recipe-rocker.js',
                license: 'MIT',
                main: './recipe-rocker.bundle.js',
                module: './module.js',
                name: 'Reciper Rocker',
                repository: {
                    type: 'git',
                    url: 'https://github.com/recipes/rocker.git'
                },
                typings: './toppings.d.ts',
                version: '9.9.9'
            }, null, 2));
            test.end();
        });
    });

    suite.test('should update flat files by appending user-added entries', (test) => {
        const { getTemplates } = mocks;
        const { inquire } = mocks.erector;
        const answers = [
            {
                name: 'name',
                answer: 'my-package'
            },
            {
                name: 'packageName',
                answer: 'my-package'
            }
        ];
        const inquireAnswers = [
            {
                name: 'proceed',
                answer: true
            }
        ];
        let existing = 'pizza\nburgers\nice cream';
        const include = mockOnce('files', 'include');
        const open = mockOnce('files', 'open');

        include.returns({
            name: 'big-package'
        });
        open.returns(answers);
        inquire.resetBehavior();
        inquire.resolves(inquireAnswers);
        test.plan(2);

        make().then(() => {
            const updateFlat = getTemplates.lastCall.args[2][0].update;
            test.equal(updateFlat(existing, 'pizza\nice cream\ntacos'), 'pizza\nice cream\ntacos\nburgers');
            test.equal(updateFlat(existing, 'pizza\r\nice cream\r\ntacos'), 'pizza\r\nice cream\r\ntacos\r\nburgers');
            test.end();
        });
    });

    suite.end();
});
