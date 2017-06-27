'use strict';

const librarianUtils = require('angular-librarian/commands/utilities');
const path = require('path');
const rollup = require('rollup');
const rollupSourcemaps = require('rollup-plugin-sourcemaps');
const rollupUglify = require('rollup-plugin-uglify');

const doRollup = (libName, dirs) => {
    const es5Entry = path.resolve(dirs.es5, `${ libName }.js`);
    const es2015Entry = path.resolve(dirs.es2015, `${ libName }.js`);
    const baseConfig = {
        entry: es5Entry,
        external: [
            '@angular/common',
            '@angular/core'
        ],
        globals: {
            '@angular/common': 'ng.common',
            '@angular/core': 'ng.core'
        },
        moduleName: librarianUtils.dashToCamel(libName),
        plugins: [ rollupSourcemaps() ],
        sourceMap: true
    };
    const fesm2015Config = Object.assign({}, baseConfig, {
        entry: es2015Entry,
        dest: path.join(dirs.dist, `${ libName }.js`),
        format: 'es'
    });
    const fesm5Config = Object.assign({}, baseConfig, {
        dest: path.join(dirs.dist, `${ libName }.es5.js`),
        format: 'es'
    });
    const miniUmdConfig = Object.assign({}, baseConfig, {
        dest: path.join(dirs.dist, 'bundles', `${ libName }.umd.min.js`),
        format: 'umd',
        plugins: baseConfig.plugins.concat([rollupUglify({})])
    });
    const umdConfig = Object.assign({}, baseConfig, {
        dest: path.join(dirs.dist, 'bundles', `${ libName }.umd.js`),
        format: 'umd'
    });

    const bundles = [
        fesm2015Config,
        fesm5Config,
        miniUmdConfig,
        umdConfig
    ].map((config) =>
        rollup.rollup(config).then((bundle) =>
            bundle.write(config)
        )
    );

    return Promise.all(bundles);
};

module.exports = doRollup;
