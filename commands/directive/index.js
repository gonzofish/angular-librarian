'use strict';

const erector = require('erector-set');
const path = require('path');

const utilities = require('../utilities');
const { src } = utilities.dirs;

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
    const directiveDir =  (file) => src('{{ package }}', 'src', 'directives', file);

    return utilities.getTemplates(rootDir, __dirname, [
        {
            destination: directiveDir('{{ filename }}.directive.ts'),
            name: 'app.ts'
        },
        {
            destination: directiveDir('{{ filename }}.directive.spec.ts'),
            name: 'test.ts'
        }
    ]);
};

const getRemainingQuestions = (providedName) => {
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
            { name: 'className', answer: utilities.dashToCap(selector) + 'Directive' },
            { name: 'selector', answer: utilities.dashToCamel(selector) }
        ]);
    } else {
        questions = questions.concat(getNameQuestions);
    }

    return { answers, questions };
};

const getNameQuestions = () => [
    { name: 'filename', question: 'Directive name (in dash-case):', transform: utilities.testIsDashFormat },
    { name: 'selector', transform: utilities.dashToCamel, useAnswer: 'filename' },
    { name: 'className', transform: (value) => utilities.dashToCap(value) + 'Directive', useAnswer: 'filename' }
];

const notifyUser = (answers) => {
    const pkg = answers.find((answer) => answer.name === 'package').answer;
    const className = answers.find((answer) => answer.name === 'className').answer;
    const filename = answers.find((answer) => answer.name === 'filename').answer;

    console.info(`Don't forget to add the following to the ${ pkg }/src/${ pkg }.module.ts file:`);
    console.info(`    import { ${ className } } from './directives/${ filename }.directive';`);
    console.info(`And to add ${ className } to the NgModule declarations list`);
};