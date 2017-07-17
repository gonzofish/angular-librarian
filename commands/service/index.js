'use strict';

const erector = require('erector-set');
const path = require('path');

const utilities = require('../utilities');

module.exports = function createService(rootDir, name) {
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
    const servicesDir = path.resolve(rootDir, codeDir, 'services');

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

const generateWithKnownName = (name, templates, forExamples) => {
    const knownAnswers = [
        { name: 'filename', answer: name},
        { name: 'serviceName', answer: utilities.dashToCap(name) + 'Service' }
    ];

    erector.construct(knownAnswers, templates, true);
    notifyUser(knownAnswers, forExamples);
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

const notifyUser = (answers, forExamples) => {
    const serviceName = answers.find((answer) => answer.name === 'serviceName');
    const moduleLocation = forExamples ? 'examples/example' : 'src/*';
    const filename = answers.find((answer) => answer.name === 'filename');

    console.info(`Don't forget to add the following to the ${ moduleLocation }.module.ts file:`);
    console.info(`    import { ${serviceName.answer} } from './services/${filename.answer}.service';`);
    console.info(`And to add ${serviceName.answer} to the NgModule providers list or add as a provider to one or more components`);
};