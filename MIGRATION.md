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

Unless the migration states it, the best path of migration is to first use the
built-in upgrade command in one of the following ways:

```shell
ngl u
ngl up
ngl upgrade
npm run g u
npm run g up
npm run g ugrade
```

After doing that, following the version-specific list of migration steps.

**Again, if read the migration steps first before running this command. You
may need to take steps before running the upgrade command!**

## Migrations

- [1.0.0](#v1)
- [1.0.0-beta.13](#1beta13)
- [< 1.0.0-beta.12 to 1.0.0-beta.12](#1beta12)

### <a id="v1"></a>1.0.0

#### Removing np

Older projects that upgrade to v1.0.0 should make sure that the `np` library is
removed from the local project and installed globally. When Angular upgraded to
version 5, it upgraded RxJS to v5.5.x--the `np` library will break if it uses
RxJS past 5.4.3.

To ensure `np` is not installed locally, after upgrading Librarian (see above):

1. Check that it is not installed:
    > ```shell
    > npm ls np
    > ```
2. If `np` shows up in the `ls` command, remove it:
    > ```shell
    > npm rm --save-dev np
    > ```
3. Install it globally:
    > ```shell
    > npm install -g np
    > ```

#### Typings

For a while TypeScript has been leveraging the `@types` organization to manage
type definitions. Prior to this it used `typings`. Using `typings` now gives a
deprecation warning, so it can be removed from your projects with:

```shell
npm rm --save-dev typings
```

While this shouldn't affect your project, it is always good to remove
deprecated technologies.

### <a id="1beta13"></a>1.0.0-beta.13

A small bug was introduced and not accounted for with `tasks/rollup.js`. Line
28 reads:

```javascript
moduleName: librarianUtils.dashToCamel(nameParts.package),
```

But should read:

```javascript
moduleName: librarianUtils.caseConvert.dashToCamel(nameParts.package),
```

The bug has been fixed but will not be available until the next release.

### <a id="1beta12"></a>From < 1.0.0-beta.12 to 1.0.0-beta.12

To perform this migration, make the changes below.

Note, <package name> should be the value of the `name` attribute in your
`package.json` without scope (i.e, `@myscope/my-package` should be
`my-package`).

1. Go into your `package.json` and set the `angular-librarian` version to
   `1.0.0-beta.12`, run `npm update`, then run `ngl upgrade`
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
