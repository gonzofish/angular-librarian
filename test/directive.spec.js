/*
    caseConvert.checkIsDashFormat
    caseConvert.dashToCamel
    caseConvert.dashToCap
    caseConvert.testIsDashFormat
    files.getTemplates
    files.resolver.*
    opts.parseOptions
    opts.checkIsForExamples
*/
'use strict';

const erector = require('erector-set');
const path = require('path');
const sinon = require('sinon');
const tap = require('tap');

const directive = require('../commands/directive');
const logging = require('../tools/logging');
const utilities = require('../tools/utilities');

const caseConvert = utilities.caseConvert;
const files = utilities.files;
const opts = utilities.options;
const sandbox = sinon.sandbox.create();

const make = function() {
    return directive.call(directive, ['./'].concat(Array.from(arguments)));
};

let checkDashFormat;
let checkForExamples;
let construct;
let create;
let dashToCamel;
let dashToCap;
let getTemplates;
let inquire;
let log;
let logger;
let parseOptions;
let root;
let testDashFormat;

tap.test('command: directive', (suite) => {
    suite.beforeEach((done) => {
        construct = sandbox.stub(erector, 'construct');
        inquire = sandbox.stub(erector, 'inquire');
        logger = sandbox.stub(logging, 'create');
        log = sandbox.spy();
        parseOptions = sandbox.stub(opts, 'parseOptions');

        inquire.rejects();
        logger.returns({
            info: log,
            log: log,
            error: log,
            warning: log
        });
        parseOptions.returns({});

        done();
    });

    suite.test('should create a Directive logger', (test) => {
        test.plan(1);

        make().catch(() => {
            test.ok(logger.calledWith('Directive'));
            test.end();
        });
    });

    suite.end();
});