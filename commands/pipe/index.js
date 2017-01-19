'use strict';

const erector = require('erector-set');
const path = require('path');

const utilities = require('../utilities');

module.exports = (rootDir, name) => {
    const templates = getTemplates(rootDir);

    if (checkHasName(name)) {
        generateWithKnownPipeName(name, templates);
    } else {
        erector.build(getAllQuestions(), templates).then(notifyUser);
    }
};

const checkHasName = (name) =>
    name && name.trim().length > 0;

const getTemplates = (rootDir) => {
    const pipesDir = path.resolve(rootDir, 'src', 'pipes');

    return utilities.getTemplates(rootDir, __dirname, [
        {
            destination: path.resolve(pipesDir, '{{ filename }}.pipe.ts'),
            name: 'app.ts'
        },
        {
            destination: path.resolve(pipesDir, '{{ filename }}.pipe.spec.ts'),
            name: 'spec.ts'
        }
    ]);
};

const generateWithKnownPipeName = (name, templates) => {
    const knownAnswers = [
        { name: 'filename', answer: name},
        { name: 'pipeName', answer: utilities.dashToCamel(name) },
        { name: 'className', answer: utilities.dashToCap(name) + 'Pipe'}
    ];

    erector.construct(knownAnswers, templates, true);
    notifyUser(knownAnswers);
};

const getAllQuestions = () => [
    { name: 'filename', question: 'Pipe name (in dash-case):', transform: (value) => utilities.checkIsDashFormat(value) ? value : null },
    { name: 'pipeName', transform: utilities.dashToCamel, useAnswer: 'filename' },
    { name: 'className', tranform: (value) => utilities.dashToCap(value) + 'Pipe', useAnswer: 'filename' }
];

const notifyUser = (answers) => {
    const className = answers.find((answer) => answer.name === 'className');
    const filename = answers.find((answer) => answer.name === 'filename');

    console.info(`Don't forget to add the following to the module.ts file:`);
    console.info(`    import { ${className.answer} } from './pipes/${filename.answer}.pipe';`);
    console.info(`And to add ${className.answer} to the NgModule declarations list`);
};