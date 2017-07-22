'use strict';

const fs = require('fs');
const path = require('path');

exports.deleteFolder = (folder)  => {
    if (fs.existsSync(folder)) {
        fs.readdirSync(folder).forEach((file) => removePath(folder, file));
        fs.rmdirSync(folder);
    }
};

const removePath = (folder, file) => {
    const filepath = path.resolve(folder, file);

    if (fs.lstatSync(filepath).isDirectory()) {
        exports.deleteFolder(filepath);
    } else {
        fs.unlinkSync(filepath);
    }
};

exports.getTemplates = (rootDir, directory, filenames) => filenames.map((filename) => ({
    check: filename.check,
    destination: filename.destination || path.resolve(rootDir, filename.name),
    template: filename.blank ? undefined : [directory, 'templates', filename.name].join(path.sep),
    update: filename.update,
    overwrite: filename.overwrite
}));

exports.resolver = {
    create() {
        const base = resolvePath(this.root(), arguments);

        return function() {
            return resolvePath(base, arguments);
        };
    },
    root() {
        return resolvePath(process.cwd(), arguments);
    }
};

const resolvePath = (prefix, args) => {
    const argsList = Array.prototype.slice.call(args);

    return path.resolve.apply(path.resolve, [prefix].concat(argsList));
};