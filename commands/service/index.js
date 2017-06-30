'use strict';

const erector = require('erector-set');
const path = require('path');

const utilities = require('../utilities');

module.exports = (rootDir, name) => {
    const templates = getTemplates(rootDir);

    if (utilities.checkIsDashFormat(name)) {
        generateWithKnownName(name, templates);
    } else {
        erector.build(getAllQuestions(), templates);
    }
};

const checkHasName = (name) =>
    name && name.trim().length > 0;

const getTemplates = (rootDir) => {
    const servicesDir = path.resolve(rootDir, 'src', 'services');

    return utilities.getTemplates(rootDir, __dirname, [
        {
            destination: path.resolve(servicesDir, '{{ filename }}.service.ts'),
            name: 'app.ts'
        },
        {
            destination: path.resolve(servicesDir, '{{ filename }}.service.spec.ts'),
            name: 'spec.ts'
        }
    ]);
};

const generateWithKnownName = (name, templates) => {
    const knownAnswers = [
        { name: 'filename', answer: name},
        { name: 'serviceName', answer: utilities.dashToCap(name) + 'Service' }
    ];

    erector.construct(knownAnswers, templates, true);
    notifyUser(knownAnswers);
}

const getAllQuestions = () => [
    {
        name: 'filename',
        question: 'Service name (in dash-case):',
        transform: (value) => utilities.checkIsDashFormat(value) ? value : null
    },
    {
        name: 'serviceName',
        transform: (value) => utilities.dashToCap(value) + 'Service',
        useAnswer: 'filename'
    }
];

const notifyUser = (answers) => {
    const serviceName = answers.find((answer) => answer.name === 'serviceName');
    const filename = answers.find((answer) => answer.name === 'filename');

    console.info(`Don't forget to add the following to the module.ts file:`);
    console.info(`    import { ${serviceName.answer} } from './services/${filename.answer}.service';`);
    console.info(`And to add ${serviceName.answer} to the NgModule providers list or add as a provider to one or more components`);
};
