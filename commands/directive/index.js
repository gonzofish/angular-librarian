'use strict';

const erector = require('erector-set');

const logging = require('../../tools/logging');
const utilities = require('../utilities');

const caseConvert = utilities.caseConvert;
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
    const templates = getTemplates(rootDir, forExamples);

    if (caseConvert.checkIsDashFormat(name)) {
        return generateWithKnownName(name, templates, forExamples);
    } else {
        return erector.inquire(getAllQuestions()).then((answers) => {
            erector.construct(answers, templates);
            notifyUser(answers, forExamples);
        });
    }
};

const getTemplates = (rootDir, forExamples) => {
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

const generateWithKnownName = (name, templates, forExamples) => {
    const knownAnswers = [
        { name: 'name', answer: name },
        { name: 'className', answer: caseConvert.dashToCap(name) + 'Directive' },
        { name: 'selector', answer: caseConvert.dashToCamel(name) }
    ];

    erector.construct(knownAnswers, templates, true);
    notifyUser(knownAnswers, forExamples);
};

const getAllQuestions = () => [
    { name: 'name', question: 'Directive name (in dash-case):', transform: caseConvert.testIsDashFormat },
    { name: 'selector', transform: caseConvert.dashToCamel, useAnswer: 'name' },
    { name: 'className', transform: (value) => caseConvert.dashToCap(value) + 'Directive', useAnswer: 'name' }
];

const notifyUser = (answers, forExamples) => {
    const className = answers.find((answer) => answer.name === 'className');
    const moduleLocation = forExamples ? 'examples/example' : 'src/*';
    const name = answers.find((answer) => answer.name === 'name');

    logger.info(`Don't forget to add the following to the ${ moduleLocation }.module.ts file:`);
    logger.info(`    import { ${className.answer} } from './directives/${name.answer}.directive';`);
    logger.info(`And to add ${className.answer} to the NgModule declarations list`);
};