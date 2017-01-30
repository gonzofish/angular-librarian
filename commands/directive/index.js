'use strict';

const erector = require('erector-set');
const path = require('path');
const utilities = require('../utilities');

module.exports = (rootDir, name) => {
    const templates = getTemplates(rootDir);

    if (utilities.checkIsDashFormat(name)) {
        generateWithKnownName(name, templates);
    } else {
        erector.build(getAllQuestions(), templates).then(notifyUser);
    }
};

const getTemplates = (rootDir) => {
    const directiveDir = path.resolve(rootDir, 'src', 'directives');

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

const generateWithKnownName = (name, templates) => {
    const knownAnswers = [
        { name: 'name', answer: name },
        { name: 'className', answer: utilities.dashToCap(name) + 'Directive' },
        { name: 'selector', answer: utilities.dashToCamel(name) }
    ];

    erector.construct(knownAnswers, templates, true);
    notifyUser(knownAnswers);
};

const getAllQuestions = () => [
    { name: 'name', question: 'Directive name (in dash-case):', transform: utilities.testIsDashFormat },
    { name: 'selector', transform: utilities.dashToCamel, useAnswer: 'name' },
    { name: 'className', tranform: (value) => utilities.dashToCap(value) + 'Directive', useAnswer: 'name' }
];

const notifyUser = (answers) => {
    const className = answers.find((answer) => answer.name === 'className');
    const name = answers.find((answer) => answer.name === 'name');

    console.info(`Don't forget to add the following to the module.ts file:`);
    console.info(`    import { ${className.answer} } from './directives/${name.answer}.directive';`);
    console.info(`And to add ${className.answer} to the NgModule declarations list`);
};