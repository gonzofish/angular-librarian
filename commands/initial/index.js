'use strict';

const childProcess = require('child_process');
const erector = require('erector-set');
const fs = require('fs');
const path = require('path');
const utilities = require('../utilities');

module.exports = (rootDir) => {
    erector.inquire(getQuestions()).then((answers) => {
        const srcDir = path.resolve(rootDir, 'src');
        let templateList = [
            { name: '.npmignore' },
            { name: 'index.ts' },
            { name: 'karma.conf.js' },
            { destination: path.resolve(srcDir, '{{ name }}.module.ts'), name: 'module.ts' },
            { name: 'package.json' },
            { name: 'README.md' },
            { destination: path.resolve(srcDir, 'index.ts'), name: 'src-index.ts' },
            { name: 'test.ts' },
            { name: 'tsconfig.json' },
            { name: 'tslint.json' },
            { blank: true, name: 'typings.json', }
        ];
        const gitAnswer = answers.find((answer) => answer.name === 'git');
        let templates;

        if (gitAnswer.answer) {
            templateList.push({ name: '.gitignore' });
        }

        templates = utilities.getTemplates(rootDir, __dirname, templateList);
        erector.construct(answers, templates, true);

        const startingDir = __dirname;

        process.chdir(rootDir);
        if (gitAnswer.answer) {
            initGit(rootDir);
        }
        console.info('Installing Node modules');
        execute('npm i');
        console.info('Node modules installed');
        process.chdir(startDir);
    });
};

const getQuestions = () => [
    { name: 'name', question: 'Library name:', transform: checkNameFormat },
    { name: 'readmeTitle', question: 'README Title:' },
    { name: 'repoUrl', question: 'Repository URL:' },
    { name: 'git', question: 'Reinitialize Git project (y/N)?', transform: utilities.createYesNoValue('n') },
    { name: 'moduleName', useAnswer: 'name', transform: utilities.dashToCap },
    { name: 'version', useAnswer: 'repoUrl', transform: () => '0.0.0' }
];

const checkNameFormat = (value) => {
    if (!utilities.checkIsDashFormat(value)) {
        value = null;
    }

    return value;
}

const initGit = (rootDir) => {
    console.info('Removing existing Git project');
    utilities.deleteFolder(path.resolve(rootDir, '.git'));
    console.info('Initializing new Git project');
    execute('git init');
    console.info('Git project initialized');
};

const execute = (command) => {
    childProcess.execSync(command, { stdio: [0, 1, 2] });
};