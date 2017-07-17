'use strict';

const erector = require('erector-set');
const path = require('path');
const utilities = require('../utilities');

module.exports = function createDirective(rootDir, name) {
    const providedOptions = Array.from(arguments).slice(name && name[0] !== '-' ? 2 : 1);
    const options = utilities.parseOptions(providedOptions, [
        'example',
        'examples',
        'x'
    ]);
    const forExamples = utilities.checkIsForExamples(options);
    const templates = getTemplates(rootDir, forExamples);

    if (utilities.checkIsDashFormat(name)) {
        generateWithKnownName(name, templates, forExamples);
    } else {
        erector.inquire(getAllQuestions()).then((answers) => {
            erector.construct(answers, templates);
            notifyUser(answers, forExamples);
        });
    }
};

const getTemplates = (rootDir, forExamples) => {
    const codeDir = forExamples ? 'examples' : 'src';
    const directiveDir = path.resolve(rootDir, codeDir, 'directives');

    return utilities.getTemplates(rootDir, __dirname, [
        {
            destination: path.resolve(directiveDir, '{{ name }}.directive.ts'),
            name: 'app.ts'
        },
        {
            destination: path.resolve(directiveDir, '{{ name }}.directive.spec.ts'),
            name: 'test.ts'
        }
    ]);
};

const generateWithKnownName = (name, templates, forExamples) => {
    const knownAnswers = [
        { name: 'name', answer: name },
        { name: 'className', answer: utilities.dashToCap(name) + 'Directive' },
        { name: 'selector', answer: utilities.dashToCamel(name) }
    ];

    erector.construct(knownAnswers, templates, true);
    notifyUser(knownAnswers, forExamples);
};

const getAllQuestions = () => [
    { name: 'name', question: 'Directive name (in dash-case):', transform: utilities.testIsDashFormat },
    { name: 'selector', transform: utilities.dashToCamel, useAnswer: 'name' },
    { name: 'className', transform: (value) => utilities.dashToCap(value) + 'Directive', useAnswer: 'name' }
];

const notifyUser = (answers, forExamples) => {
    const className = answers.find((answer) => answer.name === 'className');
    const moduleLocation = forExamples ? 'examples/example' : 'src/*';
    const name = answers.find((answer) => answer.name === 'name');

    console.info(`Don't forget to add the following to the ${ moduleLocation }.module.ts file:`);
    console.info(`    import { ${className.answer} } from './directives/${name.answer}.directive';`);
    console.info(`And to add ${className.answer} to the NgModule declarations list`);
};