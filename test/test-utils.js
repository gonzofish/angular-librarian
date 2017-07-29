'use strict';

const erector = require('erector-set');

const logging = require('../tools/logging');
const utilities = require('../tools/utilities');

exports.makeMake = (command) =>
    function() {
        return command.apply(command, ['./'].concat(Array.from(arguments)));
    };

exports.mock = (sandbox) => {
    const mocks = {
        erector: {
            construct: sandbox.stub(erector, 'construct'),
            inquire: sandbox.stub(erector, 'inquire')
        },
        log: sandbox.spy(),
        logger: sandbox.stub(logging, 'create'),
        parseOptions: sandbox.stub(utilities.options, 'parseOptions'),
        resolver: {
            create: sandbox.stub(utilities.files, 'create'),
            root: sandbox.stub(utilities.files, 'root'),
        }
    };

    mocks.erector.inquire.rejects();
    mocks.logger.returns({
        error: mocks.log,
        info: mocks.log,
        log: mocks.log,
        warning: mocks.log
    });
    mocks.parseOptions.returns({});
    mocks.resolver.create.callsFake(function() {
        const createPath = argPath(arguments);
        return function() {
            return `/created/${ createPath }/` + argPath(arguments);
        };
    });
    mocks.resolver.root.callsFake(function() {
        return '/root/' + argsPath(arguments);
    });

    return mocks;
};

exports.singleMock = (sandbox, util, method) =>
    sandbox.stub(utilities[util], method);

const argPath = (args) => Array.from(arguments).join('/');
