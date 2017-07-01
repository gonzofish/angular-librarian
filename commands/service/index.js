'use strict';

const erector = require('erector-set');
const path = require('path');

const utilities = require('../utilities');
const { joinApply, src } = utilities.dirs;

module.exports = (rootDir, name) => {
    const templates = getTemplates(rootDir);
    const remaining = getRemainingQuestions(name);
    const questions = remaining.questions.reduce(
        (all, method) => all.concat(method(remaining.answers)), []
    );

    erector.inquire(questions).then((answers) => {
        const allAnswers = remaining.answers.concat(answers);

        erector.construct(allAnswers, templates);
        notifyUser(allAnswers);
    });
};

const getTemplates = (rootDir) => {
    const servicesDir = (file) => src('{{ package }}', 'src', 'services', file);

    return utilities.getTemplates(rootDir, __dirname, [
        {
            destination: servicesDir('{{ filename }}.service.ts'),
            name: 'app.ts'
        },
        {
            destination: servicesDir('{{ filename }}.service.spec.ts'),
            name: 'spec.ts'
        }
    ]);
};

const getRemainingQuestions = (providedName) => {
    // pkg, name
    const { pkg, selector } = utilities.getPackageSelector(providedName);
    let answers = [];
    let questions = [];

    if (pkg) {
        answers = [
            { answer: pkg, name: 'package' }
        ]
    } else {
        questions = [ utilities.getPackageQuestion ];
    }

    if (utilities.checkIsDashFormat(selector)) {
        answers = answers.concat([
            { name: 'filename', answer: selector },
            { name: 'serviceName', answer: utilities.dashToCap(selector) + 'Service' }
        ]);
    } else {
        questions = questions.concat(getNameQuestions);
    }

    return { answers, questions };
};

const getNameQuestions = () => [
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
    const pkg = answers.find((answer) => answer.name === 'package').answer;
    const serviceName = answers.find((answer) => answer.name === 'serviceName').answer;
    const filename = answers.find((answer) => answer.name === 'filename').answer;

    console.info(`Don't forget to add the following to the ${ pkg }/src/${ pkg }.module.ts file:`);
    console.info(`    import { ${serviceName} } from './services/${filename}.service';`);
    console.info(`And to add ${serviceName} to the NgModule providers list or add as a provider to one or more components`);
};
