# Migration Guides

If this guide is not clear, feel free to [create an issue](https://github.com/gonzofish/angular-librarian/issues/new?title=[Migration]%20)!

## Custom Configurations

For all migrations, first, make sure you have no altered any of the following
files:

- `karma.conf.js`
- `tasks/rollup.js`
- `webpack/*`

If you have, it is **highly** suggested that you move whatever customizations
you have done into configuration files per the
[Custom Configurations](README.md#custom-config) section of the `README.md`.

## Upgrading

The best path of migration is to use the built-in upgrade command in
one of the following ways:

```shell
ngl u
ngl up
ngl upgrade
npm run g u
npm run g up
npm run g ugrade
```

After doing that, following the version-specific list of migration steps.

## Migrations

- [< 1.0.0-beta.12 to 1.0.0-beta.12](#1beta12)


### <a id="1beta12"></a>From < 1.0.0-beta.12 to 1.0.0-beta.12

To migrate to this version, manually change the following <package name> should
be the value of the `name` attribute in your `package.json` without scope (i.e,
`@myscope/my-package` should be `my-package`):

1. Remove files:
    - `tsconfig.build.json`
    - `webpack/webpack.build.json`
2. Remove from `package.json`:
    - `scripts`
        - `build:aot`
        - `build:copy`
        - `build:pack`
        - `pretagVersion`
    - `jsnext:main`
    - `types`
3. Add to `package.json`:
    - `"es2015": "./<package name>.js"`
    - `"module": "./<package name>.es5.js"`
    - `"typings": "./<package name>.d.ts"`
4. Change in `package.json`:
    - `"main": "./<package name>.bundle.js"` to `"main": "./bundles/<package name>.umd.js"`
    - `"angular-librarian": "<version>"` to `"angular-librarian": "1.0.0-beta.12"`
5. Change in build TS configs (`tsconfig.es5.json` and `tsconfig.es2015.json`):
    - `"flatModuleOutFile": "{{ packageName }}.js"` to
      `"flatModuleOutFile": "<package name>.js"`
6. Any Angular packages you may be pulling in, should be added to a
   `configs/rollup.config.js`, per the [Custom Configurations](README.md#custom-config)
   documentation. For instance, if you pull in `@angular/forms`, the Rollup config would
   be:

```javascript
'use strict';

module.exports = {
    external: [
        '@angular/forms',
    ],
    globals: {
        '@angular/forms': 'ng.forms',
    }
};
```

Run `npm install` and/or `npm update` again, to ensure all dependencies are up-to-date.
