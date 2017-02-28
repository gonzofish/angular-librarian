'use strict';

const childProcess = require('child_process');
const erector = require('erector-set');
const fs = require('fs');
const path = require('path');
const utilities = require('../utilities');

module.exports = (rootDir) => {
    erector.inquire(getQuestions(), true).then((answers) => {
        const srcDir = path.resolve(rootDir, 'src');
        let templateList = [
            { destination: path.resolve(rootDir, '.npmignore'), name: '__npmignore' },
            { blank: true, name: 'examples/example.component.html' },
            { blank: true, name: 'examples/example.component.scss' },
            { name: 'examples/example.component.ts' },
            { name: 'examples/example.main.ts' },
            { name: 'examples/example.module.ts' },
            { name: 'examples/index.html' },
            { blank: true, name: 'examples/styles.scss' },
            { name: 'index.ts' },
            { name: 'karma.conf.js', overwrite: true },
            { destination: path.resolve(srcDir, '{{ name }}.module.ts'), name: 'src/module.ts' },
            { name: 'package.json', update: 'json' },
            { name: 'README.md' },
            { destination: path.resolve(srcDir, 'index.ts'), name: 'src/index.ts' },
            { destination: path.resolve(srcDir, 'test.js'), name: 'src/test.js', overwrite: true },
            { name: 'tsconfig.json', overwrite: true },
            { name: 'tsconfig.test.json', overwrite: true },
            { name: 'tslint.json', overwrite: true },
            { destination: path.resolve(srcDir, 'vendor.ts'), name: 'src/vendor.ts' },
            { name: 'tasks/test.js', overwrite: true },
            { name: 'webpack/webpack.build.js', overwrite: true },
            { name: 'webpack/webpack.dev.js', overwrite: true },
            { name: 'webpack/webpack.test.js', overwrite: true }
        ];
        const gitAnswer = answers.find((answer) => answer.name === 'git');
        let templates;

        if (gitAnswer.answer) {
            templateList.push({ destination: path.resolve(rootDir, '.gitignore'), name: '__gitignore' });
        }

        templates = utilities.getTemplates(rootDir, __dirname, templateList);
        erector.construct(answers, templates);

        const startingDir = __dirname;

        process.chdir(rootDir);
        if (gitAnswer.answer) {
            initGit(rootDir);
        }

        console.info('Installing Node modules');
        execute('npm i');
        console.info('Node modules installed');
        process.chdir(startingDir);
    });
};

const getQuestions = () => [
    { name: 'name', question: 'Library name:', transform: checkNameFormat },
    { name: 'readmeTitle', question: 'README Title:' },
    { name: 'repoUrl', question: 'Repository URL:' },
    { name: 'git', question: 'Reinitialize Git project (y/N)?', transform: utilities.createYesNoValue('n') },
    { name: 'moduleName', useAnswer: 'name', transform: (value) => utilities.dashToCap(value) + 'Module' },
    { name: 'version', question: 'Version:' }
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
