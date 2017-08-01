'use strict';

const erector = require('erector-set');
const path = require('path');

const logging = require('../logging');
const utilities = require('../utilities');

const caseConvert = utilities.caseConvert;
const colorize = utilities.colorize;
const files = utilities.files;
const opts = utilities.options;
let logger;

module.exports = function createPipe(rootDir, name) {
    logger = logging.create('Pipe');

    const providedOptions = Array.from(arguments).slice(name && name[0] !== '-' ? 2 : 1);
    const options = opts.parseOptions(providedOptions, [
        'example',
        'examples',
        'x'
    ]);
    const forExamples = opts.checkIsForExamples(options);

    if (caseConvert.checkIsDashFormat(name)) {
        return generateWithKnownPipeName(name, forExamples);
    } else {
        return erector.inquire(getAllQuestions()).then((answers) =>
            construct(answers, forExamples)
        );
    }
};

const generateWithKnownPipeName = (name, forExamples) => {
    const knownAnswers = [
        { name: 'filename', answer: name },
        { name: 'pipeName', answer: caseConvert.dashToCamel(name) },
        { name: 'className', answer: caseConvert.dashToCap(name) + 'Pipe'}
    ];

    return Promise.resolve()
        .then(() => construct(knownAnswers, forExamples));
};

const construct = (answers, forExamples) => {
    const result = erector.construct(answers, getTemplates(forExamples));
    notifyUser(answers, forExamples);

    return result;
};

const getTemplates = (forExamples) => {
    const codeDir = forExamples ? 'examples' : 'src';
    const pipesDir = files.resolver.create(codeDir, 'pipes');


    return files.getTemplates(files.resolver.root(), __dirname, [
        {
            destination: pipesDir('{{ filename }}.pipe.ts'),
            name: 'app.ts'
        },
        {
            destination: pipesDir('{{ filename }}.pipe.spec.ts'),
            name: 'spec.ts'
        }
    ]);
};

const getAllQuestions = () => [
    { name: 'filename', question: 'Pipe name (in dash-case):', transform: (value) => caseConvert.checkIsDashFormat(value) ? value : null },
    { name: 'pipeName', transform: caseConvert.dashToCamel, useAnswer: 'filename' },
    { name: 'className', transform: (value) => caseConvert.dashToCap(value) + 'Pipe', useAnswer: 'filename' }
];

const notifyUser = (answers, forExamples) => {
    const className = answers.find((answer) => answer.name === 'className');
    const filename = answers.find((answer) => answer.name === 'filename');
    const moduleLocation = forExamples ? 'examples/example' : 'src/*';

    logger.info(
        colorize.colorize(`Don't forget to add the following to the`, 'green'),
        `${ moduleLocation }.module.ts`,
        colorize.colorize('file:', 'green')
    );
    logger.info(
        colorize.colorize(`    import { ${className.answer} } from './pipes/${filename.answer}.pipe';`, 'cyan')
    );
    logger.info(
        colorize.colorize('And to add', 'green'),
        className.answer,
        colorize.colorize('to the NgModule declarations list', 'green')
    );
};
