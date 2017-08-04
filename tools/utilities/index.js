'use strict';

exports.caseConvert = require('./case-convert');
exports.colorize = require('./colorize');
exports.execute = require('./execute');
exports.files = require('./files');
exports.inputs = require('./inputs');
exports.options = require('./options');

exports.checkIsScopedName = (name) =>
    // @
    // followed by 1+ non-/
    // followed by /
    // folloer by 1+ non-/
    /^@[^/]+[/][^/]+$/.test(name);

exports.getLibrarianVersion = () => {
    const files = exports.files;
    const pkgVersion = getPackageLibrarianVersion();
    let version;

    // if they have specified a URL, keep the URL
    if (/^(git+)?http\:\:/.test(pkgVersion)) {
        version = pkgVersion;
    } else {
        // otherwise, use the version from the package
        version = files.include(
            files.resolver.manual(__dirname, '..', '..', 'package.json')
        ).version;
    }

    return version;
};

const getPackageLibrarianVersion = () => {
    const files = exports.files;
    const pkg = files.include(
        files.resolver.root('package.json')
    );
    let version;

    if (pkg.devDependencies && 'angular-librarian' in pkg.devDependencies) {
        version = pkg.devDependencies['angular-librarian'];
    } else if (pkg.dependencies && 'angular-librarian' in pkg.dependencies) {
        version = pkg.dependencies['angular-librarian'];
    }

    return version;
};