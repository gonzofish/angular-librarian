'use strict';

const childProcess = require('child_process');
const sinon = require('sinon');
const tap = require('tap');

const colorize = require('../tools/utilities/colorize');
const logging = require('../tools/logging');
const npm = require('../commands/npm');

const cmd = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';
const sandbox = sinon.sandbox.create();

tap.test('command: npm', (suite) => {
    const testRun = (test, type, args) => {
        npm.apply(npm, ['./'].concat(type)).then(() => {})
        test.ok(spawn.calledWith(
            cmd,
            ['run'].concat(args),
            { stdio: ['inherit', 'inherit', 'pipe'] }
        ));
    };

    let spawn;

    suite.beforeEach((done) => {
        sandbox.restore();
        spawn = sandbox.stub(childProcess, 'spawnSync');
        spawn.returns({ status: 0 });
        done();
    });

    suite.afterEach((done) => {
        sandbox.restore();
        done();
    });

    suite.test('should run the build command with b & build', (test) => {
        test.plan(2);

        testRun(test, 'b', 'build');
        testRun(test, 'build', 'build');

        test.end();
    });

    suite.test('should run the lint command with l & lint', (test) => {
        test.plan(2);

        testRun(test, 'l', 'lint');
        testRun(test, 'lint', 'lint');

        test.end();
    });

    suite.test('should run the publish command with pub & publish', (test) => {
        test.plan(2);

        testRun(test, ['pub', '1.0.1'], ['tagVersion', '1.0.1']);
        testRun(test, ['publish', '1.0.0'], ['tagVersion', '1.0.0']);

        test.end();
    });

    suite.test('should run the serve command with v & serve', (test) => {
        test.plan(2);

        testRun(test, 'v', 'start');
        testRun(test, 'server', 'start');

        test.end();
    });

    suite.test('should run the test command with t & test', (test) => {
        test.plan(2);

        testRun(test, ['t', 'watch'], ['test', 'watch']);
        testRun(test, ['test', 'headless'], ['test', 'headless']);

        test.end();
    });

    suite.test('should return a promise', (test) => {
        test.plan(1);

        npm('./', 'b').then(() => {
            test.ok(true);
            test.end();
        });
    });

    suite.test('rejections', (subSuite) => {
        let color;
        let log;
        let logger;

        subSuite.beforeEach((done) => {
            color = sandbox.stub(colorize, 'colorize');
            log = sandbox.spy();
            logger = sandbox.stub(logging, 'create');

            color.callsFake((text, color) => `[${ color }]${ text }[/${ color }]`);
            logger.returns({
                error: log
            });
            done();
        });

        subSuite.afterEach(() => {
            spawn.reset();
        });

        subSuite.test('should reject if an error happens', (test) => {
            spawn.callsFake(() => {
                throw new Error(`I'm afraid I've got some bad news!`);
            });

            test.plan(1);

            npm('./').catch((error) => {
                test.equal(error, `I'm afraid I've got some bad news!`);
                test.end();
            });
        });

        subSuite.test('should return output.error if it exists', (test) => {
            spawn.returns({ error: new Error(`I'm afraid I've got some bad news?`) });
            test.plan(1);

            npm('./').catch((error) => {
                test.equal(error, `I'm afraid I've got some bad news?`);
                test.end();
            });
        });

        subSuite.test('should return an error if stderr has a value', (test) => {
            spawn.returns({ stderr: { toString() { return `I'm afraid I've got some bad news.`; } } });
            test.plan(1);

            npm('./').catch((error) => {
                test.equal(error, `I'm afraid I've got some bad news.`);
                test.end();
            });
        });

        subSuite.test('should return an error if the output.status is not 0', (test) => {
            spawn.returns({ status: 1 });
            test.plan(1);

            npm('./', 'pizza').catch((error) => {
                test.equal(error, `Execution of "pizza" errored, see above for more information.`);
                test.end();
            });
        });

        subSuite.end();
    });

    suite.end();
});
