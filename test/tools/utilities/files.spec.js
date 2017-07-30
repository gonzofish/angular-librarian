'use strict';

const fs = require('fs');
const path = require('path');
const sinon = require('sinon');
const tap = require('tap');

const files = require('../../resolver')(__filename);

let mockCwd;
let mockResolve;

tap.test('#deleteFolder', (suite) => {
    const del = files.deleteFolder;
    let exists;
    let lstat;
    let readdir;
    let rmdir;
    let unlink;

    suite.beforeEach((done) => {
        exists = sinon.stub(fs, 'existsSync');
        lstat = sinon.stub(fs, 'lstatSync');
        mockResolve = sinon.stub(path, 'resolve');
        readdir = sinon.stub(fs, 'readdirSync');
        rmdir = sinon.stub(fs, 'rmdirSync');
        unlink = sinon.stub(fs, 'unlinkSync');

        done();
    });

    suite.afterEach((done) => {
        exists.restore();
        lstat.restore();
        mockResolve.restore();
        readdir.restore();
        rmdir.restore();
        unlink.restore();

        done();
    });

    suite.test('should check if the folder exists', (test) => {
        test.plan(1);

        exists.returns(false);
        del('pizza/party');

        test.ok(exists.calledWith('pizza/party'));

        test.end();
    });

    suite.test('should read the directory\'s contents', (test) => {
        test.plan(1);

        exists.returns(true);
        readdir.returns([]);
        del('pizza/party');

        test.ok(readdir.calledWith('pizza/party'));

        test.end();
    });

    suite.test('should remove the directory', (test) => {
        test.plan(1);

        exists.returns(true);
        readdir.returns([]);
        del('pizza/party');

        test.ok(rmdir.calledWith('pizza/party'));

        test.end();
    });

    suite.test('should check if each file is a directory', (test) => {
        test.plan(3);

        exists.returns(true);
        readdir.returns([
            '12345',
            '67890'
        ]);
        lstat.returns({
            isDirectory() { return false; }
        });
        mockResolve.callsFake((prefix, suffix) => prefix + '/' + suffix);
        del('pizza/party');

        test.ok(lstat.calledTwice);
        test.ok(lstat.calledWith('pizza/party/12345'));
        test.ok(unlink.calledWith('pizza/party/12345'));

        test.end();
    });

    suite.test('should delete any child files & folders', (test) => {
        test.plan(2);

        exists.callsFake((dir) => dir === 'pizza/party');
        readdir.returns([
            '12345',
            '67890'
        ]);
        lstat.callsFake((dir) => ({
            isDirectory() { return dir === 'pizza/party/67890'; }
        }));
        mockResolve.callsFake((prefix, suffix) => prefix + '/' + suffix);

        del('pizza/party');

        test.ok(unlink.calledWith('pizza/party/12345'));
        test.ok(exists.calledWith('pizza/party/67890'));

        test.end();
    });

    suite.end();
});

tap.test('#getTemplates', (suite) => {
    const create = (templates) =>
        files.getTemplates('/root', '/root/current', templates);
    let mockResolve;

    suite.beforeEach((done) => {
        mockResolve = sinon.stub(path, 'resolve');
        mockResolve.callsFake(function() {
            return Array.prototype.slice.call(arguments)
                .join('/');
        });

        done();
    });

    suite.afterEach((done) => {
        mockResolve.restore();

        done();
    });

    suite.test('should return a list of erector template objects', (test) => {
        test.plan(1);

        const templates = create([
            { name: 'pizza', overwrite: false },
            { name: 'broccoli', update: true },
            { name: 'burger' }
        ]);

        test.deepEqual(templates, [
            {
                check: undefined,
                destination: '/root/pizza',
                overwrite: false,
                template: '/root/current/templates/pizza',
                update: undefined
            },
            {
                check: undefined,
                destination: '/root/broccoli',
                overwrite: undefined,
                template: '/root/current/templates/broccoli',
                update: true
            },
            {
                check: undefined,
                destination: '/root/burger',
                overwrite: undefined,
                template: '/root/current/templates/burger',
                update: undefined
            }
        ]);

        test.end();
    });

    suite.test('should utilize the destination field if provided', (test) => {
        test.plan(1);

        const templates = create([
            { name: 'pizza', destination: '/the/pizzeria/palace' },
            { name: 'burger' }
        ]);

        test.deepEqual(templates, [
            {
                check: undefined,
                destination: '/the/pizzeria/palace',
                overwrite: undefined,
                template: '/root/current/templates/pizza',
                update: undefined
            },
            {
                check: undefined,
                destination: '/root/burger',
                overwrite: undefined,
                template: '/root/current/templates/burger',
                update: undefined
            }
        ]);

        test.end();
    });

    suite.test('should provide a blank template if .blank is truthy', (test) => {
        test.plan(1);

        const templates = create([
            { name: 'pizza' },
            { blank: true, name: 'broccoli' }
        ]);

        test.deepEqual(templates, [
            {
                check: undefined,
                destination: '/root/pizza',
                overwrite: undefined,
                template: '/root/current/templates/pizza',
                update: undefined
            },
            {
                check: undefined,
                destination: '/root/broccoli',
                overwrite: undefined,
                template: undefined,
                update: undefined
            }
        ]);

        test.end();
    });

    suite.end();
});

tap.test('.resolver', (suite) => {
    const resolver = files.resolver;

    suite.beforeEach((done) => {
        mockCwd = sinon.stub(process, 'cwd');
        mockCwd.returns('root');

        mockResolve = sinon.stub(path, 'resolve');
        mockResolve.callsFake(function() {
            return Array.from(arguments).join('/');
        });

        done();
    });

    suite.afterEach((done) => {
        mockCwd.restore();
        mockResolve.restore();
    });

    suite.test('.create should return a method', (test) => {
        test.plan(2);

        const method = resolver.create('make', 'pizza');

        test.equal(typeof method, 'function');
        test.equal(method('large', 'pepperoni'), 'root/make/pizza/large/pepperoni');

        test.end();
    });

    suite.test('.manual should create a manual path', (test) => {
        test.plan(1);

        test.equal(
            resolver.manual('taco', 'lettuce', 'cheese', 'tomato'),
            'taco/lettuce/cheese/tomato'
        );

        test.end();
    });

    suite.test('.root should return the root path plus any other arguments', (test) => {
        test.plan(1);

        test.equal(
            resolver.root('burger', 'cheese'),
            'root/burger/cheese'
        );

        test.end();
    });

    suite.end();
});