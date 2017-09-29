# Angular Librarian

[![Build Status](https://semaphoreci.com/api/v1/gonzofish/angular-librarian/branches/master/badge.svg)](https://semaphoreci.com/gonzofish/angular-librarian)
[![codecov](https://codecov.io/gh/gonzofish/angular-librarian/branch/master/graph/badge.svg)](https://codecov.io/gh/gonzofish/angular-librarian)
[![npm version](https://badge.fury.io/js/angular-librarian.svg)](https://badge.fury.io/js/angular-librarian)

An Angular 2+ scaffolding setup. Generates AOT-compliant code using similar
paradigms to the [Angular CLI](https://github.com/angular/angular-cli).

- [Migration Guides](MIGRATION.md)
- [To Use the `ngl` Command](#ngl-command)
- [Usage](#usage)
- [Generative Commands](#generative-commands)
    - [initialize](#init)
    - [component](#component)
    - [directive](#directive)
    - [pipe](#pipe)
    - [service](#service)
- [Project Commands](#project-commands)
    - [build](#build)
    - [lint](#lint)
    - [publish](#publish)
    - [server](#serve)
    - [test](#test)
    - [upgrade](#upgrade)
- [Unit Testing](#unit)
- [Custom Configurations](#custom-config)
    - [Karma Configuration](#karma-config)
    - [Rollup Configuration](#rollup-config)
    - [Webpack Configurations](#webpack-configs)
- [Packaging](#pack)
- [Contributing](#contribute)



## <a id="ngl-command"></a>To Use the ngl Command

The `ngl` command does _not_ install globally by default. To get it working
there are some additional steps. To learn how to install it on your system,
take a look at [`CLI.md`](CLI.md).

If you do _not_ want to use the `ngl` command, please see the commands in
"[Generative Commands](#generative-commands)" and
"[Project Commands](#project-commands)" for the alternative usage.


## Usage

Create a new folder and initialize an NPM project:

```shell
> mkdir my-lib
> cd my-lib
> npm init -f
```

Install this package to your project:

```shell
> npm i -D angular-librarian
```

The following command (`ngl`) is not available out of the box. To set it up, see
"[To Use the ngl Command](#to-use-the-ngl-command)".

Then initialize your project:

```shell
> ngl i

Library name: my-lib
README Title: My Library
Repository URL: https://github.com/me/my-lib
Reinitialize Git project (y/N)?
Installing Node modules
...NPM install occurs
Node modules installed
```

## Generative Commands

Generative commands create files for different parts of your library.
There are multiple ways to execute commands:

```shell
ngl <command_name> [<args>]
```

or

```shell
npm run g <command_name> [<args>]
```

or

```shell
node ./node_modules/angular-librarian <command_name> [<args>]
```

The `ngl` command-line tool and `npm run g` are both aliases for calling
`node ./node_modules/angular-librarian`. Note that all arguments are optional.

Command | Purpose
--- | ---
[initial](#init) | Sets up the project
[component](#component) | Creates a component
[directive](#directive) | Creates a directive
[pipe](#pipe) | Creates a pipe
[service](#service) | Creates a service

### <a id="init"></a>initialize (aliases: i, init)

Sets up the project. Can also be run to update a project to the latest Angular Librarian configuration.

#### Call signature

```shell
ngl i <options>
ngl init <options>
ngl initialize <options>
npm run g i <options>
npm run g init <options>
npm run g initialize <options>
```

#### Options

- `--no-install` / `--ni`: Skip installing Node modules

#### Prompts
- `Library name:` a dash-cased name that is used in constructing the `package.json`
    and `*.module.ts` file. It is also used to create the class name of the module.
- `README Title:` the string to insert in the `README.md` file
- `Repository URL:` the repository where the code will be held
- `Reinitialize Git project (y/N)?`: if left blank, defaults to no. If yes or y are
    entered, it will reinitialize a git project.

#### Output

Creates the project structure and a slew of files:

```
|__examples/
   |__example.component.html
   |__example.component.ts
   |__example.main.ts
   |__example.module.ts
   |__index.html
|__node_modules/
   |__...
|__src/
   |__<library name>.module.ts
   |__index.ts
   |__test.ts
|__webpack/
   |__webpack.dev.js
   |__webpack.test.js
|__.gitignore
|__.npmignore
|__index.ts
|__karma.conf.js
|__package.json
|__README.md
|__tsconfig.json
|__tslint.json
```

- `examples/`: where the example usage of the library can be shown
- `examples/example.component.html`: the example application's root component template
- `examples/example.component.ts`: the example application's root component
- `examples/example.main.ts`: the example application's main file
- `examples/example.module.ts`: the example application module
- `examples/index.html`: the example application's main HTML file
- `node_modules/`: where the dependencies installed via NPM are stored
- `src/`: where the bulk of application & test code is.
- `src/<library name>.module.ts`: the main module of the library
- `src/index.ts`: a barrel file for easy exporting of classes; makes it easier
    on consumers to access parts of the code for importing.
- `webpack/`: contains the Wepack configuration files
- `webpack/webpack.dev.js`: this file is used when running the webpack-dev-server
- `webpack/webpack.test.js`: used when running unit tests
- `.gitignore`: the list of file & folder patterns to not commit to git
- `.npmignore`: the list of file & folder patterns to not publish to NPM
- `index.ts`: another barrel file
- `karma.conf.js`: the testing setup for the project
- `package.json`: holds the list of dependencides for the project, scripts, and
    other metadata about the library
- `README.md`: a markdown file best used for providing users with an overview of
    the library
- `test.ts`: contains code needed to get the Angular test environment bootstrapped
- `tsconfig.json`: the TypeScript configuration for the project
- `tslint.json`: the linting rules for the project
- `vendor.ts`: contains a list of dependencies that Angular needs loaded before the
    application is loaded


### <a id="component"></a>component (alias: c)

Generates a component

#### Call signatures

```shell
ngl c <options>
ngl component <selector> <options>
npm run g c <options>
npm run g component <selector> <options>
```

#### Options

- `--defaults` / `-d`: Create a component with file-based templates & styles, no
   lifecycle hooks
- `--examples` / `-x`: Generate the component in the `examples` directory
- `--hooks=<list of hooks>` / `--h=<list of hooks>`: Use the provided lifecycle
   hooks.
- `--inline-styles` / `--is`: Use inline styles
- `--inline-template` / `--it`: Use an inline template


#### Prompts

- `What is the component selector (in dash-case)?`: the selector for the component.
   This prompt is skipped if a selector is provided when the command is made.
   The selector is used to generate the component filenames and class name.
- `Use inline styles (y/N)?`: if the user provides `n`, `no`, or a blank, the
    component is set up with non-inline styles. If the user provides `y` or `yes`,
    the component is set up with inline styles.
- `Use inline template (y/N)?`: if the user provides `n`, `no`, or a blank, the
    component is set up with a non-inline template. If the user provides `y` or
    `yes`, the component is set up with an inline template.
- `Lifecycle hooks (comma-separated):` users can pass a list of lifecycle hooks in
    a comma-separated list which will then be added to the component. Understood
    values are: `changes`, `check`, `destroy`, `init`, `onchanges`, `docheck`,
    `ondestroy`, and `oninit`.

#### Output

In the `src` directory, a sub-directory will be created with the `selector` name
and a `component.ts`, `component.spec.ts`, and, if necessary, `component.html` and
`component.scss` files.

```shell
|__src
   |__<selector>
      |__<selector>.component.html
      |__<selector>.component.scss
      |__<selector>.component.spec.ts
      |__<selector>.component.ts
```

### <a id="directive"></a>directive (alias: d)

Generates a directive

#### Call signatures

```shell
ngl d <options>
ngl directive <directive-name> <options>
npm run g d <options>
npm run g directive <directive-name> <options>
```

#### Options

- `--examples` / `-x`: Generate the directive in the `examples` directory

#### Prompts

- `Directive name (in dash-case):` this prompt is asking for the name of the directive,
    in dash-case. If the directive name is provided when the command is executed,
    this prompt is skipped. The directive name is used to generate the directive's
    filenames, class name and the actual directive used in templates.

#### Output

In the `src` directory, under a `directives` sub-directory, two files will be added
for a service--a `directive.ts` and `directive.spec.ts` file.

```shell
|__src
   |__directives
      |__<directive-name>.directive.spec.ts
      |__<directive-name>.directive.ts
```

### <a id="service"></a>service (alias: s)

Generates a service

#### Call signatures

```shell
ngl s <options>
ngl service <service-name> <options>
npm run g s <options>
npm run g service <service-name> <options>
```

- `--examples` / `-x`: Generate the service in the `examples` directory

#### Prompts

- `Service name (in dash-case):` this prompt is asking for the name of the service,
    in dash-case. If the service name is provided when the command is executed,
    this prompt is skipped. The service name is used to generate the service's
    filenames and class name.

#### Output

In the `src` directory, under a `services` sub-directory, two files will be added
for a service--a `service.ts` and `service.spec.ts` file.

```shell
|__src
   |__services
      |__<service-name>.service.spec.ts
      |__<service-name>.service.ts
```

### <a id="pipe"></a>pipe (alias: p)

Generates a pipe

#### Call signatures

```shell
ngl p <options>
ngl p <pipe-name> <options>
npm run g p <options>
npm run g p <pipe-name> <options>
```

- `--examples` / `-x`: Generate the pipe in the `examples` directory

#### Prompts

- `Pipe name (in dash-case):` this prompt is asking for the name of the pipe,
    in dash-case. If the pipe name is provided when the command is executed,
    this prompt is skipped. The pipe name is used to generate the pipe's
    filenames, class name and the actual pipe used in templates.

#### Output

In the `src` directory, under a `pipes` sub-directory, two files will be added
for a service--a `pipe.ts` and `pipe.spec.ts` file.

```shell
|__src
   |__pipes
      |__<pipe-name>.pipe.spec.ts
      |__<pipe-name>.pipe.ts
```

## <a id="project-commands"></a>Project Commands

There are commands provided out of the box, as NPM scripts. They are:

Command     | Purpose
---         | ---
[build](#build) | Runs code through build process via Angular compiler (ngc)
[lint](#lint) | Verify code matches linting rules
[publish](#publish) | Creates tag for new version and publishes
[serve](#serve) | Run Webpack's dev-server on project
[test](#test) | Execute unit tests
[upgrade](#upgrade) | Upgrade current project to latest Angular Librarian

### <a id="build"></a>build (alias: b)

Build the library's code. This will run the code through
the `ngc` compiler and compile the code for distribution.

#### Call signatures

```shell
ngl build
ngl b
npm run build
```

### <a id="lint"></a>lint (alias: l)

Lint code through TSLint

#### Call signatures

```shell
ngl lint
ngl l
npm run lint
```

### <a id="publish"></a>publish (alias: pub)

Create a tag and publish the library code using the
[`np` library](https://github.com/sindresorhus/np). Optionally,
arguments can be passed to make the build work faster.

> **Note**: only use the optional arguments if you are 100% confident
> your code works with the current dependencies & passes all tests!

#### Call signatures

```shell
ngl publish <option>
ngl pub <option>
npm run tagVersion <option>
```

- `no-cleanup`/`nc`: publishes but does not do a cleanup of `node_modules`
- `yolo`/`y`: publishes but does not do a cleanup of `node_modules` nor
    does it run tests.

### <a id="serve"></a>serve (alias: v)

Start the webpack dev server and run the library
code through it.

#### Call signatures

```shell
ngl serve
ngl v
npm start
```

We use `start` for direct `npm` commands to keep the command as
concise as possible.

### <a id="test"></a>test (alias: t)

Run unit tests on code. For unit test types, see the
[unit testing](#unit) section below.

#### Call signatures

```shell
ngl test <type>
ngl t <type>
npm test <type>

```

### <a id="upgrade"></a>upgrade (alias: u, up)

Upgrades the current project to the latest Angular Librarian (if necessary) and
update managed files to the latest versions.

Managed files are:

- `.gitignore`*
- `.npmignore`*
- karma.conf.js
- `package.json`*
- `tsconfig.es2015.json`
- `tsconfig.es5.json`
- `tsconfig.json`
- `tsconfig.test.json`
- `tslint`
- `src/test.js`
- `tasks/`
- `webpack/`

Any files with a asterisk (*) next to their name have a merge strategy associated with them:
- `.gitignore` and `.npmignore` will take any custom lines (case-sensitive) and add them to the new file
- `package.json` will ensure any dependencies you've added are kept in the `dependencies` and `devDependencies` attributes, as necessary.

#### Call signatures

```shell
ngl upgrade
ngl up
ngl u
npm run g upgrade
npm run g up
npm run g u
```

## <a id="unit"></a>Unit Testing

Unit testing is done using Karma and Webpack. The setup is all done during the `initialize` command.
The provided testing commands will watch your files for changes.

The following commands are described in the [`test` command](#test) section.


These commands call the script at `tasks/test.js` and runs the Karma test runner to execute the tests.
Prior to running Karma, the `test` command looks for a command line argument, if the argument is known,
it will run the associated configuration, otherwise it will run the default configuration.

Configurations:

Command | Testing TypeScript
---     | ---
default | Run through PhantomJS one time with no file watching
headless (aliases: hl, h)| Run through PhantomJS with files being watched & tests automatically re-run
watch (alias: w)| Run through Chrome with files being watched & tests automatically re-run

Note that Chrome still requires a manual refresh on the Debug tab to see updated test results.

## <a id="custom-config"></a>Custom Configurations

Some configurations can be extended with custom properties. These
configurations should be placed in a `configs` directory under the project's
root directory with the corresponding name:

- [Karma configuration](#karma-config) (`karma.conf.js`)
- [Rollup configuration](#rollup-config) (`rollup.config.js`)
- [Webpack configurations](#webpack-configs)
    - `webpack.dev.js`
    - `webpack.test.js`

### <a id="karma-config"></a>Karma Configuration

A custom Karma configuration should be a Node module that exports a function.
The exported function will be relay the Karma `config` variable. If provided,
any supported attributes provided will be merged.

Those attributes and their merge strategies are:

- Array attributes will create an array of unique values for that attribute and
    append the existing attribute; these fields are:
    - `browsers`
    - `files`
    - `plugins`
    - `reporters`
- Objects will append new keys, but keep any existing ones--making it so values
    provided by Angular Librarian can _not_ be overridden:
    - `preprocessors`
- Primitive values will be replaced:
    - `color`
    - `logLevel`
    - `port`

### <a id="rollup-config"></a>Rollup Configuration

The rollup configuration will append the provided attributes to create a new
attribute of unique values. The attributes supported:

- `commonjs`: a list of CommonJS dependencies to pull in. Will always include `node_modules/rxjs/**` to properly rollup RxJS.
- `external`: creates a new array of unique values
- `globals`: adds new attributes to the object

_Note_: there is no file provided named `rollup.config.js` like other
configuration files--instead the configuration is maintained in
`tasks/rollup.js`.

### <a id="webpack-configs"></a>Webpack Configurations

Either of the Webpack configurations can be extended by providing a file with a
matching name in `configs`. The configuration is applied using the
`webpack-merge` library.

## <a id="pack"></a>Packaging

To test your packages output before publishing, run the following commands:

```shell
ngl build
cd dist
npm pack
```

These commands will build the output files into a `dist` directory, change into
the `dist` directory, and generate a compressed file containing your library as
it will look when packaged up and published to NPM. The packaging process
removes any files specific to developing your library, such as `*.spec.ts` files
and `.npmignore`.

### Unscoped Structure

The basic structure of a published, unscoped library is:

```
|__bundles/
   |__<library name>.umd.js
   |__<library name>.umd.js.map
   |__<library name>.umd.min.js
   |__<library name>.bundle.min.js.map
|__index.d.ts
|__package.json
|__README.md
|__*.d.ts
|__<library name>.d.ts
|__<library name>.es5.js
|__<library name>.es5.js.map
|__<library name>.js
|__<library name>.js.map
|__<library name>.metadata.json
|__<library name>.module.d.ts
```

### Scoped Structure

For a scoped package, the structure will appear slightly different:

```
|__@<scope name>/
   |__<library name>.es5.js
   |__<library name>.es5.js.map
   |__<library name>.js
   |__<library name>.js.map
|__bundles/
   |__<library name>.umd.js
   |__<library name>.umd.js.map
   |__<library name>.umd.min.js
   |__<library name>.bundle.min.js.map
|__index.d.ts
|__package.json
|__README.md
|__*.d.ts
|__<library name>.d.ts
|__<library name>.metadata.json
|__<library name>.module.d.ts
```

## <a id="contribute"></a>Contributing

If you'd like to contribute to Angular Librarian, please see the
[contributing guide](.github/CONTRIBUTING.md)!
