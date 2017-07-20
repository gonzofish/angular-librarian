'use strict';

const childProcess = require('child_process');
const erector = require('erector-set');
const path = require('path');

const logging = require('../logging');
const utilities = require('../utilities');

module.exports = (rootDir) => {
    const logger = logging.create('Initial');

    return erector.inquire(getQuestions(), true, getPreviousTransforms()).then((answers) => {
        const srcDir = path.resolve(rootDir, 'src');
        let templateList = [
            { destination: path.resolve(rootDir, '.gitignore'), name: '__gitignore' },
            { destination: path.resolve(rootDir, '.npmignore'), name: '__npmignore' },
            { name: 'DEVELOPMENT.md' },
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
            { name: 'tsconfig.es2015.json', overwrite: true },
            { name: 'tsconfig.es5.json', overwrite: true },
            { name: 'tsconfig.test.json', overwrite: true },
            { name: 'tslint.json', overwrite: true },
            { destination: path.resolve(srcDir, 'vendor.ts'), name: 'src/vendor.ts' },
            { name: 'tasks/build.js', overwrite: true },
            { name: 'tasks/copy-build.js', overwrite: true },
            { name: 'tasks/copy-globs.js', overwrite: true },
            { name: 'tasks/inline-resources.js', overwrite: true },
            { name: 'tasks/rollup.js', overwrite: true },
            { name: 'tasks/test.js', overwrite: true },
            { name: 'webpack/webpack.common.js', overwrite: true },
            { name: 'webpack/webpack.dev.js', overwrite: true },
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

        log('Installing Node modules');
        execute('npm i');
        log('Node modules installed');
        process.chdir(startingDir);
    }).catch((error) => logger.error(error.message));
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
