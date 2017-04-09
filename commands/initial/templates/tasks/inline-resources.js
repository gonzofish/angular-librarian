'use strict';
// original code by the Angular Material 2 team

const fs = require('fs');
const glob  = require('glob');
const path = require('path');
const sass = require('node-sass');

const inlineResources = (globs, sourcePrefix) => {
    if (typeof globs === 'string') {
        globs = [globs];
    }

    globs.forEach((pattern) => replaceSource(pattern, sourcePrefix));
};

const replaceSource = (pattern, sourcePrefix) => {
    // pattern is a directory
    if (pattern.indexOf('*') === -1) {
        pattern = path.join(pattern, '**', '*');
    }

    const files = glob.sync(pattern, {})
        .filter((name) => /\.ts$/.test(name));

    files.forEach((filePath) => {
        fs.readFile(filePath, 'utf8', (error, content) => {
            if (error) {
                throw error;
            }

            let fileContents = inlineResourcesFromString(content, sourcePrefix, (url) =>
                path.join(path.dirname(filePath), url)
            );
            //# sourceMappingURL=test.bundle.js.map
            fileContents = fileContents.replace(/\/\/#\s*sourceMappingURL=(.+)(\r?\n)?/, (match, url) => {
                const lastSlash = url.lastIndexOf('/');
                const relativeUrl = url.substring(lastSlash + 1);

                return match.replace(url, relativeUrl);
            });


            fs.writeFile(filePath, fileContents);
        });
    });
};

const inlineResourcesFromString = (content, sourcePrefix, callback) => [
    inlineTemplate, inlineStyle, removeModuleId
].reduce((final, method) => method(final, sourcePrefix, callback), content);

const inlineTemplate = (content, sourcePrefix, callback) =>
    content.replace(/templateUrl:\s*'([^']+?\.html)'/g, (match, url) => {
        const mini = getMiniContents(url, sourcePrefix, callback);

        return `template: "${mini}"`;
    });

const inlineStyle = (content, sourcePrefix, callback) =>
    content.replace(/styleUrls:\s*(\[[\s\S]*?\])/gm, (match, styleUrls) => {
        const urls = eval(styleUrls);   // string -> array
        return 'styles: [' + urls.map((url) => {
            const mini = getMiniContents(url, sourcePrefix, callback);

            return `"${mini}"`;
        }).join(',\n') + ']';
    });

const getMiniContents = (url, sourcePrefix, callback) => {
    const file = callback(url);
    let template = fs.readFileSync(file.replace(/^dist/, sourcePrefix), 'utf8');

    if (file.match(/\.s(a|c)ss$/) && template) {
        // convert SASS -> CSS
        template = sass.renderSync({ data: template });
        template = template.css.toString();
    }

    return minifyText(template);
};

const minifyText = (text) => text
    .replace(/([\n\r]\s*)+/gm, ' ')
    .replace(/"/g, '\\"');

const removeModuleId = (content) =>
    content.replace(/\s*moduleId:\s*module\.id\s*,?\s*/gm, '');

module.exports = inlineResources;

if (!module.parent) {
    inlineResources('./build', 'src');
}
