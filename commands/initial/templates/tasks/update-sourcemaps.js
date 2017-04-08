'use strict';
// original code by the Angular Material 2 team

const fs = require('fs');
const glob  = require('glob');
const path = require('path');
const sass = require('node-sass');

const updateAllSourcemaps = (globs) => {
    if (typeof globs === 'string') {
        globs = [globs];
    }

    globs.forEach((pattern) => updateSourceMaps(pattern));
};

const updateSourceMaps = (pattern) => {
    // pattern is a directory
    if (pattern.indexOf('*') === -1) {
        pattern = path.join(pattern, '**', '*');
    }

    const files = glob.sync(pattern, {})
        .filter((name) => /\.js$/.test(name));

    files.forEach((filePath) => {
        fs.readFile(filePath, 'utf8', (error, content) => {
            if (error) {
                throw error;
            }

            //# sourceMappingURL=test.bundle.js.map
            const fileContents = content.replace(/\/\/#\s*sourceMappingURL=(.+)(\r?\n)?/, (match, url) => {
                const lastSlash = url.lastIndexOf('/');
                const relativeUrl = url.substring(lastSlash + 1);

                return match.replace(url, relativeUrl);
            });


            fs.writeFile(filePath, fileContents);
        });
    });
};module.exports = updateAllSourcemaps;

if (!module.parent) {
    updateAllSourcemaps('./dist', 'src');
}
