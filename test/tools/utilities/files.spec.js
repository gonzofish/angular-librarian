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

tap.test('#open', (suite) => {
    const contents = `I'm a delicious pizza!`;
    let open = files.open;
    let read;

    suite.beforeEach((done) => {
        read = sinon.stub(fs, 'readFileSync');
        read.returns(contents);

        done();
    });

    suite.afterEach((done) => {
        read.restore();
        done();
    });

    suite.test('should return the contents', (test) => {
        test.plan(2);

        test.equal(open('./my-file.txt'), contents);
        test.ok(read.calledWith('./my-file.txt'));

        test.end();
    });

    suite.test('should parse the contents with JSON.parse if the json flag is true', (test) => {
        const parse = sinon.stub(JSON, 'parse');
        const jsonContents = 'JSON pizza!';

        parse.returns(jsonContents);

        test.plan(2);

        test.equal(open('./my-file.txt', true), jsonContents);
        test.ok(parse.calledWith(contents));

        parse.restore();
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
        done();
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

tap.test('.librarianVersions', (suite) => {
    const versions = files.librarianVersions;

    suite.test('#checkIsBranch should return true for URLs', (test) => {
        const check = versions.checkIsBranch;

        test.plan(5);

        test.ok(check('https://github.com/gonzofish/angular-librarian'));
        test.ok(check('http://github.com/gonzofish/angular-librarian'));
        test.ok(check('git+https://github.com/gonzofish/angular-librarian'));
        test.ok(check('git+http://github.com/gonzofish/angular-librarian'));
        test.notOk(check('pizza'));

        test.end();
    });

    suite.test('#get should return the installed angular-librarian version for non-branch', (test) => {
        const dirname = [process.cwd(), 'tools', 'utilities'].join(path.sep);
        const include = sinon.stub(files, 'include');
        const manual = sinon.stub(files.resolver, 'manual');
        const root = sinon.stub(files.resolver, 'root');

        include.callsFake((version) => {
            if (version === 'banana') {
                return { version };
            } else {
                return {
                    devDependencies: {
                        'angular-librarian': version
                    }
                };
            }
        });
        manual.returns('banana')
        root.returns('pizza');

        test.plan(5);

        test.equal(versions.get(), 'banana');
        test.ok(root.calledWith('package.json'));
        test.ok(include.calledWith('pizza'));
        test.ok(manual.calledWith(dirname, '..', '..', 'package.json'));
        test.ok(include.calledWith('banana'));

        include.restore();
        manual.restore();
        root.restore();

        test.end();
    });

    suite.test('#get should use the angular-librarian in dependencies if its not in devDependencies', (test) => {
        const include = sinon.stub(files, 'include');
        const manual = sinon.stub(files.resolver, 'manual');
        const root = sinon.stub(files.resolver, 'root');

        include.callsFake((version) => {
            if (version === 'banana') {
                return { version };
            } else {
                return {
                    dependencies: {
                        'angular-librarian': version
                    }
                };
            }
        });
        manual.returns('banana')
        root.returns('pizza');

        test.plan(1);

        versions.get();
        test.ok(include.calledWith('pizza'));

        include.restore();
        manual.restore();
        root.restore();

        test.end();
    });

    suite.test('#get should use the angular-librarian installed if none exists in the project package.json', (test) => {
        const include = sinon.stub(files, 'include');
        const manual = sinon.stub(files.resolver, 'manual');
        const root = sinon.stub(files.resolver, 'root');

        include.callsFake((version) => {
            if (version === 'banana') {
                return { version };
            }
        });
        manual.returns('banana')
        root.returns('pizza');

        test.plan(1);

        test.equal(versions.get(), 'banana');

        include.restore();
        manual.restore();
        root.restore();

        test.end();
    });

    suite.test('#get should return the URL for an installed branch version', (test) => {
        const include = sinon.stub(files, 'include');
        const manual = sinon.stub(files.resolver, 'manual');
        const root = sinon.stub(files.resolver, 'root');

        include.callsFake((version) => {
            return {
                devDependencies: {
                    'angular-librarian': 'https://' + version
                }
            };
        });
        root.returns('pizza');

        test.plan(2);

        test.equal(versions.get(), 'https://pizza');
        test.notOk(manual.called);

        include.restore();
        manual.restore();
        root.restore();

        test.end();
    });

    suite.end();
});
