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
        npm.apply(npm, ['./'].concat(type));
        test.ok(spawn.calledWith(
            cmd,
            ['run'].concat(args),
            { stdio: 'inherit' }
        ));
    };

    let spawn;

    suite.beforeEach((done) => {
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

    suite.test('should reject if an error happens', (test) => {
        const color = sandbox.stub(colorize, 'colorize');
        const log = sandbox.spy();
        const logger = sandbox.stub(logging, 'create');

        color.callsFake((text, color) => `[${ color }]${ text }[/${ color }]`);
        logger.returns({
            error: log
        });
        spawn.callsFake(() => {
            throw new Error(`I'm afraid I've got some bad news!`);
        });

        test.plan(1);

        npm('./').catch((error) => {
            test.equal(error, `I'm afraid I've got some bad news!`);
            test.end();
        });
    });

    suite.end();
});
