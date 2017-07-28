'use strict';

const erector = require('erector-set');

const logging = require('../../tools/logging');
const utilities = require('../utilities');

const caseConvert = utilities.caseConvert;
const colorize = utilities.colorize;
const files = utilities.files;
const opts = utilities.options;
const resolver = files.resolver;

let logger;

module.exports = function createDirective(rootDir, name) {
    logger = logging.create('Directive');

    const providedOptions = Array.from(arguments).slice(name && name[0] !== '-' ? 2 : 1);
    const options = opts.parseOptions(providedOptions, [
        'example', 'examples', 'x'
    ]);
    const forExamples = opts.checkIsForExamples(options);

    if (caseConvert.checkIsDashFormat(name)) {
        return generateWithKnownName(name, forExamples);
    } else {
        return erector.inquire(getAllQuestions()).then((answers) => {
            construct(answers, forExamples);
        });
    }
};

const generateWithKnownName = (name, forExamples) => Promise.resolve().then(() => {
    construct([
        { name: 'name', answer: name },
        { name: 'className', answer: caseConvert.dashToCap(name) + 'Directive' },
        { name: 'selector', answer: caseConvert.dashToCamel(name) }
    ], forExamples);
});

const getAllQuestions = () => [
    { name: 'name', question: 'Directive name (in dash-case):', transform: caseConvert.testIsDashFormat },
    { name: 'selector', transform: caseConvert.dashToCamel, useAnswer: 'name' },
    { name: 'className', transform: (value) => caseConvert.dashToCap(value) + 'Directive', useAnswer: 'name' }
];

const construct = (answers, forExamples) => {
    erector.construct(answers, getTemplates(forExamples));
    notifyUser(answers, forExamples);
};

const getTemplates = (forExamples) => {
    const codeDir = forExamples ? 'examples' : 'src';
    const directiveDir = resolver.create(codeDir, 'directives');

    return files.getTemplates(resolver.root(), __dirname, [
        {
            destination: directiveDir('{{ name }}.directive.ts'),
            name: 'app.ts'
        },
        {
            destination: directiveDir('{{ name }}.directive.spec.ts'),
            name: 'test.ts'
        }
    ]);
};

const notifyUser = (answers, forExamples) => {
    const className = answers.find((answer) => answer.name === 'className');
    const moduleLocation = forExamples ? 'examples/example' : 'src/*';
    const name = answers.find((answer) => answer.name === 'name');

    logger.info(
        colorize.colorize(`Don't forget to add the following to the`, 'green'),
        `${ moduleLocation }.module.ts`,
        colorize.colorize('file:', 'green')
    );
    logger.info(
        `    import { ${ className.answer } } from './directives/${ name.answer }.directive';`
    );
    logger.info(
        colorize.colorize('And to add', 'green'),
        `${ className.answer }`,
        colorize.colorize('to the NgModule declarations list', 'green')
    );
};