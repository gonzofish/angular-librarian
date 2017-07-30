'use strict';

const erector = require('erector-set');
const path = require('path');

const logging = require('../../tools/logging');
const { caseConvert, colorize, files, options } = require('../../tools/utilities');

let logger;

module.exports = function createService(rootDir, name) {
    logger = logging.create('Service');

    const providedOptions = Array.from(arguments).slice(name && name[0] !== '-' ? 2 : 1);
    const opts = options.parseOptions(providedOptions, [
        'example',
        'examples',
        'x'
    ]);
    const forExamples = options.checkIsForExamples(opts);

    if (caseConvert.checkIsDashFormat(name)) {
        return generateWithKnownName(name, forExamples);
    } else {
        return erector.inquire(getAllQuestions()).then((answers) => {
            construct(answers, forExamples);
        });
    }
};

const generateWithKnownName = (name, forExamples) => {
    const knownAnswers = [
        { name: 'filename', answer: name},
        { name: 'serviceName', answer: caseConvert.dashToCap(name) + 'Service' }
    ];

    return Promise.resolve()
        .then(() => construct(knownAnswers, forExamples));
}

const getAllQuestions = () => [
    {
        name: 'filename',
        question: 'Service name (in dash-case):',
        transform: (value) => caseConvert.checkIsDashFormat(value) ? value : null
    },
    {
        name: 'serviceName',
        transform: (value) => caseConvert.dashToCap(value) + 'Service',
        useAnswer: 'filename'
    }
];

const construct = (answers, forExamples) => {
    erector.construct(answers, getTemplates(forExamples));
    notifyUser(answers, forExamples);
};

const getTemplates = (forExamples) => {
    const codeDir = forExamples ? 'examples' : 'src';
    const servicesDir = files.resolver.create(codeDir, 'services');

    return files.getTemplates(files.resolver.root(), __dirname, [
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

const notifyUser = (answers, forExamples) => {
    const moduleLocation = forExamples ? 'examples/example' : 'src/*';
    const serviceName = answers.find((answer) => answer.name === 'serviceName');
    const filename = answers.find((answer) => answer.name === 'filename');

    logger.info(
        colorize.colorize(`Don't forget to add the following to the`, 'green'),
        `${ moduleLocation }.module.ts`,
        colorize.colorize('file:', 'green')
    );
    logger.info(`    import { ${serviceName.answer} } from './services/${filename.answer}.service';`);
    logger.info(
        colorize.colorize('And to add', 'green'),
        serviceName.answer,
        colorize.colorize('to the NgModule providers list or add as a provider to one or more components', 'green')
    );
};