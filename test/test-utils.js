'use strict';

const erector = require('erector-set');
const path = require('path');

const logging = require('../tools/logging');
const utilities = require('../tools/utilities');

exports.getDirName = (command) =>
    [process.cwd(), 'commands', command].join(path.sep);

exports.getUtilMethod = (util, method) =>
    utilities[util] && utilities[util][method];

exports.makeMake = (command) =>
    function() {
        return command.apply(command, ['./'].concat(Array.from(arguments)));
    };

exports.mock = (sandbox) => {
    const mocks = {
        colorize: sandbox.stub(utilities.colorize, 'colorize'),
        erector: {
            construct: sandbox.stub(erector, 'construct'),
            inquire: sandbox.stub(erector, 'inquire')
        },
        getTemplates: sandbox.stub(utilities.files, 'getTemplates'),
        log: sandbox.spy(),
        logger: sandbox.stub(logging, 'create'),
        parseOptions: sandbox.stub(utilities.options, 'parseOptions'),
        resolver: {
            create: sandbox.stub(utilities.files.resolver, 'create'),
            root: sandbox.stub(utilities.files.resolver, 'root'),
        }
    };

    mocks.colorize.callsFake((text, color) =>
        `[${ color }]${ text }[/${ color }]`
    );
    mocks.erector.inquire.rejects();
    mocks.getTemplates.returns('fake-templates');
    mocks.logger.returns({
        error: mocks.log,
        info: mocks.log,
        log: mocks.log,
        warning: mocks.log
    });
    mocks.parseOptions.returns({});
    mocks.resolver.create.callsFake(function() {
        const createPath = argsPath(arguments);
        return function() {
            return `/created/${ createPath }/` + argsPath(arguments);
        };
    });
    mocks.resolver.root.callsFake(function() {
        return '/root/' + argsPath(arguments);
    });

    return mocks;
};

exports.mockOnce = (sandbox, util, method) =>
    sandbox.stub(utilities[util], method);

const argsPath = (args) => Array.from(args).join('/');
