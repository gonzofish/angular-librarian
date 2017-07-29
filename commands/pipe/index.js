'use strict';

const erector = require('erector-set');
const path = require('path');

const logging = require('../logging');
const utilities = require('../utilities');

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
    const templates = getTemplates(rootDir, forExamples);

    if (utilities.checkIsDashFormat(name)) {
        return generateWithKnownPipeName(name, templates, forExamples);
    } else {
        return erector.inquire(getAllQuestions()).then((answers) => {
            erector.construct(answers, templates);
            notifyUser(answers, forExamples);
        });
    }
};

const getTemplates = (rootDir, forExamples) => {
    const codeDir = forExamples ? 'examples' : 'src';
    const pipesDir = path.resolve(rootDir, codeDir, 'pipes');

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

const generateWithKnownPipeName = (name, templates, forExamples) => {
    const knownAnswers = [
        { name: 'filename', answer: name },
        { name: 'pipeName', answer: utilities.dashToCamel(name) },
        { name: 'className', answer: utilities.dashToCap(name) + 'Pipe'}
    ];

    erector.construct(knownAnswers, templates, true);
    notifyUser(knownAnswers, forExamples);
};

const getAllQuestions = () => [
    { name: 'filename', question: 'Pipe name (in dash-case):', transform: (value) => utilities.checkIsDashFormat(value) ? value : null },
    { name: 'pipeName', transform: utilities.dashToCamel, useAnswer: 'filename' },
    { name: 'className', tranform: (value) => utilities.dashToCap(value) + 'Pipe', useAnswer: 'filename' }
];

const notifyUser = (answers, forExamples) => {
    const className = answers.find((answer) => answer.name === 'className');
    const filename = answers.find((answer) => answer.name === 'filename');
    const moduleLocation = forExamples ? 'examples/example' : 'src/*';

    console.info(`Don't forget to add the following to the ${ moduleLocation }.module.ts file:`);
    console.info(`    import { ${className.answer} } from './pipes/${filename.answer}.pipe';`);
    console.info(`And to add ${className.answer} to the NgModule declarations list`);
};