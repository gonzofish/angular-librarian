'use strict';

const childProcess = require('child_process');
const erector = require('erector-set');
const fs = require('fs');
const path = require('path');
const utilities = require('../utilities');


const joinApply = (method, prefix, args) =>
    method.apply(null, [prefix].concat(Array.prototype.slice.apply(args)));

module.exports = (rootDir, ...args) => {
    erector.inquire(getQuestions(), true, getPreviousTransforms()).then((answers) => {
        const root = function() {
            return joinApply(path.resolve, rootDir, arguments);
        };
        const srcDir = function() {
            return joinApply(root, 'src', arguments);
        };
        const demoDir = function() {
            return joinApply(srcDir, 'demo', arguments);
        };
        const libDir = function() {
            return joinApply(srcDir, '{{ name }}', arguments);
        };

        let templateList = [
            { destination: path.resolve(rootDir, '.gitignore'), name: '__gitignore' },
            { destination: path.resolve(rootDir, '.npmignore'), name: '__npmignore' },
            { name: 'DEVELOPMENT.md' },
            { blank: true, name: 'src/demo/app/app.component.html' },
            { name: 'src/demo/app/app.component.ts' },
            { name: 'src/demo/app/app.module.ts' },
            { name: 'src/demo/index.html' },
            { name: 'src/demo/main.ts' },
            { blank: true, name: 'src/demo/styles.scss' },
            { name: 'src/demo/tsconfig.json' },
            { name: 'src/demo/vendor.ts' },
            { destination: libDir('index.ts'), name: 'src/lib/index.ts' },
            { destination: libDir('src', '{{ name }}.module.ts'), name: 'src/lib/src/module.ts' },
            { name: 'karma.conf.js', overwrite: true },
            { name: 'package.json', update: 'json' },
            { name: 'README.md' },
            { name: 'test.js', overwrite: true },
            { name: 'tslint.json', overwrite: true },
            { destination: root('tsconfig.json'), name: 'tsconfig/tsconfig.json', overwrite: true },
            { destination: root('tsconfig.build.json'), name: 'tsconfig/tsconfig.build.json', overwrite: true },
            { destination: libDir('tsconfig.es2105.json'), name: 'tsconfig/tsconfig.es2015.json', overwrite: true },
            { destination: libDir('tsconfig.es5.json'), name: 'tsconfig/tsconfig.es5.json', overwrite: true },
            { destination: libDir('tsconfig.test.json'), name: 'tsconfig/tsconfig.test.json', overwrite: true },
            { name: 'tasks/build.js', overwrite: true },
            { name: 'tasks/copy-build.js', overwrite: true },
            { name: 'tasks/copy-globs.js', overwrite: true },
            { name: 'tasks/inline-resources.js', overwrite: true },
            { name: 'tasks/rollup.js', overwrite: true },
            { name: 'tasks/test.js', overwrite: true },
            { name: 'webpack/webpack.common.js', overwrite: true },
            { name: 'webpack/webpack.demo.js', overwrite: true },
            { name: 'webpack/webpack.test.js', overwrite: true },
            { name: 'webpack/webpack.utils.js', overwrite: true }
        ];
        const gitAnswer = answers.find((answer) => answer.name === 'git');
        const startingDir = __dirname;
        const templates = utilities.getTemplates(rootDir, __dirname, templateList);

        erector.construct(answers, templates);

        process.chdir(rootDir);
        if (gitAnswer.answer) {
            initGit(rootDir);
        }

        if (args.indexOf('--no-install')) {
            console.info('Installing Node modules');
            execute('npm i');
            console.info('Node modules installed');
        }
        process.chdir(startingDir);
    });
};

const getQuestions = () => {
    const defaultName = require(path.resolve(process.cwd(), 'package.json')).name;

    return [
        { defaultAnswer: defaultName, name: 'name', question: `Library name:`, transform: checkNameFormat },
        { defaultAnswer: (answers) => utilities.dashToWords(answers[0].answer), name: 'readmeTitle', question: 'README Title:' },
        { name: 'repoUrl', question: 'Repository URL:' },
        { name: 'git', question: 'Reinitialize Git project (y/N)?', transform: utilities.createYesNoValue('n') },
        { name: 'moduleName', useAnswer: 'name', transform: (value) => utilities.dashToCap(value) + 'Module' },
        { name: 'version', question: 'Version:' }
    ];
};

const checkNameFormat = (value) => {
    if (!value) {
        value = '';
    } else if (!utilities.checkIsDashFormat(value)) {
        value = null;
    }

    return value;
}

const getPreviousTransforms = () => ({
    git: utilities.convertYesNoValue
});

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
