'use strict';

const childProcess = require('child_process');
const erector = require('erector-set');
const path = require('path');

const logging = require('../../tools/logging');
const utilities = require('../utilities');

const caseConvert = utilities.caseConvert;
const colorize = utilities.colorize;
const files = utilities.files;
const inputs = utilities.inputs;
const opts = utilities.options;

let logger;

module.exports = (rootDir, ...args) => {
    logger = logging.create('Initial');

    return erector.inquire(getQuestions(), true, getPreviousTransforms()).then((answers) => {
        const options = opts.parseOptions(args, [
            'no-install', 'ni',
        ]);
        const srcDir = files.resolver.create('src');
        const templateList = [
            { destination: files.resolver.root('.gitignore'), name: '__gitignore' },
            { destination: files.resolver.root('.npmignore'), name: '__npmignore' },
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
            { destination: srcDir('{{ packageName }}.module.ts'), name: 'src/module.ts' },
            { name: 'package.json', update: 'json' },
            { name: 'README.md' },
            { destination: srcDir('index.ts'), name: 'src/index.ts' },
            { destination: srcDir('test.js'), name: 'src/test.js', overwrite: true },
            { name: 'tsconfig.json', overwrite: true },
            { name: 'tsconfig.es2015.json', overwrite: true },
            { name: 'tsconfig.es5.json', overwrite: true },
            { name: 'tsconfig.test.json', overwrite: true },
            { name: 'tslint.json', overwrite: true },
            { destination: srcDir('vendor.ts'), name: 'src/vendor.ts' },
            { name: 'tasks/build.js', overwrite: true },
            { name: 'tasks/copy-build.js', overwrite: true },
            { name: 'tasks/copy-globs.js', overwrite: true },
            { name: 'tasks/inline-resources.js', overwrite: true },
            { name: 'tasks/rollup.js', overwrite: true },
            { name: 'tasks/tag-version.js', overwrite: true },
            { name: 'tasks/test.js', overwrite: true },
            { name: 'webpack/webpack.common.js', overwrite: true },
            { name: 'webpack/webpack.dev.js', overwrite: true },
            { name: 'webpack/webpack.test.js', overwrite: true },
            { name: 'webpack/webpack.utils.js', overwrite: true }
        ];
        const librarianVersion = files.librarianVersions.get();
        const gitAnswer = answers.find((answer) => answer.name === 'git');
        const templates = files.getTemplates(rootDir, __dirname, templateList);
        const results = erector.construct(answers.concat({ answer: librarianVersion, name: 'librarianVersion' }), templates);

        process.chdir(rootDir);
        if (gitAnswer.answer) {
            initGit(rootDir);
        }

        if (!('ni' in options || 'no-install' in options)) {
            logger.info(colorize.colorize('Installing Node modules', 'cyan'));
            execute('npm i');
            logger.info(colorize.colorize('Node modules installed', 'green'));
        }

        process.chdir(__dirname);

        return results;
    }).catch((error) => logger.error(colorize.colorize(error.message, 'red')));
};

const getQuestions = () => {
    const defaultName = files.include(files.resolver.root('package.json')).name;

    return [
        { defaultAnswer: defaultName, name: 'name', question: `Library name:`, transform: checkNameFormat },
        { name: 'packageName', useAnswer: 'name', transform: extractPackageName },
        { defaultAnswer: (answers) => caseConvert.dashToWords(answers[1].answer), name: 'readmeTitle', question: 'README Title:' },
        { name: 'repoUrl', question: 'Repository URL:' },
        { name: 'git', question: 'Reinitialize Git project (y/N)?', transform: inputs.createYesNoValue('n') },
        { name: 'moduleName', useAnswer: 'packageName', transform: (name) => caseConvert.dashToCap(name) + 'Module' },
        { name: 'version', question: 'Version:' }
    ];
};

const checkNameFormat = (name) => {
    if (!name) {
        name = '';
    } else if (!checkPackageName(name)) {
        const message =
        '    Package name must have no capitals or special\n' +
        '    characters and be one of the below formats:\n' +
        '        @scope/package-name\n' +
        '        package-name';

        logger.error(colorize.colorize(message, 'red'));
        name = null;
    }

    return name;
};

const checkPackageName = (name) =>
    typeof name === 'string' &&
    name.length > 0 &&
    name.length <= 214 &&
    name.trim() === name &&
    name.toLowerCase() === name &&
    /^[^._-]/.test(name) &&
    /[^._-]$/.test(name) &&
    /^(?:@[^/]+[/])?[^/]+$/.test(name) &&
    /^[a-z0-9]*$/.test(name.replace(/(^@|[-/])/g, ''));

const extractPackageName = (name) => {
    if (utilities.checkIsScopedName(name)) {
        name = name.split('/')[1];
    }

    return name;
};

const getPreviousTransforms = () => ({
    git: inputs.convertYesNoValue
});

const initGit = (rootDir) => {
    logger.info(colorize.colorize('Removing existing Git project', 'yellow'));
    files.deleteFolder(files.resolver.root('.git'));
    logger.info(colorize.colorize('Initializing new Git project', 'cyan'));
    execute('git init');
    logger.info(colorize.colorize('Git project initialized', 'green'));
};

const execute = (command) => {
    childProcess.execSync(command, { stdio: [0, 1, 2] });
};
