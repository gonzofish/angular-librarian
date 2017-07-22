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
        readdir = sinon.stub(fs, 'readdir');
        rmdir = sinon.stub(fs, 'rmdirSync');
        unlink = sinon.stub(fs, 'unlinkSync');

        done();
    });

    suite.afterEach((done) => {
        exists.restore();
        lstat.restore();
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