'use strict';

const erector = require('erector-set');
const path = require('path');
const utilities = require('../utilities');
const { joinApply, src } = utilities.dirs;
const lib = function() { return joinApply(src, '{{ libraryName }}', arguments); };

module.exports = (rootDir, name, ...args) => {
    const templates = getTemplates(rootDir);
    const options = utilities.parseOptions(args, [
        // eventually support creating a widget out of the gate
        'c',
        'component'
    ]);

    if (checkIsValidPackage(name)) {
        generateWithKnownName(name, templates);
    } else {
        erector.inquire(getAllQuestions()).then((answers) => {
            generateWithKnownName(answers[0].answer, templates);
        });
    }
};


const getTemplates = (rootDir) => utilities.getTemplates(
    rootDir, path.resolve(__dirname, '..', 'initial'), [
        { destination: lib('index.ts'), name: 'src/lib/index.ts' },
        { destination: lib('src', '{{ libraryName }}.module.ts'), name: 'src/lib/src/module.ts' },
        { destination: lib('tsconfig.es2105.json'), name: 'tsconfig/tsconfig.es2015.json', overwrite: true },
        { destination: lib('tsconfig.es5.json'), name: 'tsconfig/tsconfig.es5.json', overwrite: true },
        { destination: lib('tsconfig.test.json'), name: 'tsconfig/tsconfig.test.json', overwrite: true },
    ]
);

const generateWithKnownName = (name, templates) => {
    const knownAnswers = [
        { name: 'libraryName', answer: name },
        { name: 'moduleName', answer: utilities.dashToCap(name) + 'Module' }
    ];

    erector.construct(knownAnswers, templates);
    notifyUser(knownAnswers);
};

const getAllQuestions = () => [
    {
        name: 'libraryName',
        question: 'Library name (in dash-case):',
        transform: (value) => checkIsValidPackage(value) ? value : null
    }
];

const checkIsValidPackage = (name) =>
    utilities.checkIsDashFormat(name) && !utilities.checkPackageValidity(name);

const notifyUser = (knownAnswers) => {
    const name = knownAnswers[0].answer;
    const moduleName = knownAnswers[1].answer;

    console.info(`New library package created at src/${ name }/`);
};
