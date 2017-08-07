'use strict';

const erector = require('erector-set');
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const logging = require('../../tools/logging');
const { colorize, files, execute, inputs } = require('../../tools/utilities');
const { librarianVersions } = files;

let logger;

module.exports = (rootDir) => {
    logger = logging.create('Upgrade');
    /* istanbul ignore next */
    const npmCommand = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';

    return upgradeLibrarian(npmCommand)
        .then(upgradeFiles);
};

const upgradeLibrarian = (npmCommand) => {
    const version = librarianVersions.get();

    if (!librarianVersions.checkIsBranch(version)) {
        return getLibrarianVersions(npmCommand)
            .then((versions) => installLibrarian(npmCommand, versions));
    } else {
        return Promise.resolve()
            .then(() => upgradeBranchLibrarian(npmCommand, version));
    }
};

const upgradeBranchLibrarian = (npm, version) => {
    logger.info(colorize.colorize('Upgrading angular-librarian from:', 'green'));
    logger.info(colorize.colorize('    ' + version, 'magenta'));

    execute.execute(npm, ['up', 'angular-librarian']);
}

const getLibrarianVersions = (npm) => new Promise((resolve, reject) => {
    logger.info(colorize.colorize('Identifying the *newest* angular-librarian version', 'cyan'));
    const available = execute.execute(npm, ['show', 'angular-librarian', 'version']);
    logger.info(colorize.colorize('Identifying the *installed* angular-librarian version', 'blue'));

    try {
        const installed = parseInstalledVersion(execute.execute(npm, ['list', '--depth=0', 'angular-librarian']));

        resolve({
            available,
            installed
        });
    } catch (error) {
        reject(error.message);
    }
});

const parseInstalledVersion = (installed) => {
    const lines = installed.split(/\r?\n/);
    const librarianLine = lines.find((line) => line.indexOf('angular-librarian@') !== -1);
    let version;

    if (librarianLine) {
        version = librarianLine.match(/\bangular-librarian@[^\s]+\s?/) || [''];
        version = version[0].trim().replace('angular-librarian@', '');
    }

    if (!version || version === '(empty)') {
        throw new Error('Angular Librarian is not installed. Not sure how that\'s possible!\n\n\tRun `npm i -D angular-librarian` to install');
    }

    return version;
};

const installLibrarian = (npm, { available, installed}) => {
    const update = require('semver').gt(available, installed);

    logger.info(
        colorize.colorize('\tUpgrade of angular-librarian is', 'yellow'),
        update ? '' : colorize.colorize('NOT', 'red'),
        colorize.colorize('required.', 'yellow')
    );

    if (update) {
        logger.info(colorize.colorize(`    Installing angular-librarian@${ available }`, 'green'));
        execute.execute(npm, ['i', '-D', `angular-librarian@${ available }`]);
    }
}

const upgradeFiles = () => erector.inquire([
    {
        allowBlank: true,
        name: 'proceed',
        question: 'The following will overwrite some of the files in your project. Would you like to continue (y/N)?',
        transform: inputs.createYesNoValue('n', [])
    }
]).then((answers) => {
    if (answers[0].answer) {
        updateFiles();
    } else {
        logger.info(colorize.colorize('    Upgrade cancelled.', 'yellow'));
    }
});

const updateFiles = () => {
    logger.info(colorize.colorize('    Updating managed files to latest versions', 'cyan'));
    const answers = getErectorAnswers().concat({ answer: librarianVersions.get(), name: 'librarianVersion' });
    const srcDir = files.resolver.create('src');
    const fileList = [
        { destination: files.resolver.root('.gitignore'), name: '__gitignore', update: updateFlatFile },
        { destination: files.resolver.root('.npmignore'), name: '__npmignore', update: updateFlatFile },
        { name: 'DEVELOPMENT.md' },
        { name: 'karma.conf.js', overwrite: true },
        { name: 'package.json', update: updatePackageJson },
        /*
            the TypeScript files should be 'json', but array merging
            on JSON duplicates values so ['es6', 'dom'] merged
            from two files would be ['es6', 'dom', 'es6', 'dom']
        */
        { name: 'tsconfig.es5.json', overwrite: true },
        { name: 'tsconfig.es2015.json', overwrite: true },
        { name: 'tsconfig.json', overwrite: true },
        { name: 'tsconfig.test.json', overwrite: true },
        { name: 'tslint.json', overwrite: true },
        { destination: srcDir('test.js'), name: 'src/test.js', overwrite: true },
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
    const templates = files.getTemplates(
        files.resolver.root(),
        files.resolver.manual(__dirname, '..', 'initial'),
        fileList
    );

    erector.construct(answers, templates);

    logger.info(colorize.colorize('Files have been upgraded!', 'green'));
};

const getErectorAnswers = () => {
    // we do this because packageName may not exist from older versions
    const pkg = files.include(files.resolver.root('package.json'), 'json');
    let answers = files.open(files.resolver.root('.erector'), 'json');
    let name = answers.find((answer) => answer.name === 'name').name;
    const hasPackageName = answers.find((answer) => answer.name === 'packageName');

    if (name !== pkg.name) {
        name = pkg.name;
    }

    if (!hasPackageName) {
        answers.push({
            answer: name,
            name: 'packageName'
        });
    }

    return answers;
};

const updatePackageJson = (existing, replacement) => {
    const merged = JSON.parse(erector.updaters.json(existing, replacement));
    const exist = JSON.parse(existing);
    const alterFields = [
        'author', 'description', 'es2015',
        'keywords', 'license', 'main',
        'module', 'name', 'repository',
        'typings', 'version'
    ];

    alterFields.forEach((field) => {
        if (field in exist) {
            merged[field] = exist[field];
        }
    });

    return JSON.stringify(merged, null, 2);
};

const updateFlatFile = (existing, replacement) => {
    const newline = /\r\n/.test(replacement) ? '\r\n' : '\n';
    const replaceLines = replacement.split(/\r?\n/g);
    const missingLines = existing.split(/\r?\n/g).filter((line) =>
        replaceLines.indexOf(line) === -1
    );

    return replaceLines.concat(missingLines).join(newline);
}
