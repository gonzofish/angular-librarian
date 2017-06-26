# angular-librarian

An Angular 2+ scaffolding setup. Generates AOT-compliant code using similar
paradigms to the [Angular CLI](https://github.com/angular/angular-cli).

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
- [Unit Testing](#unit)
- [Packaging](#pack)
- [Contributing](#contribute)



## <a name="ngl-command"></a>To Use the ngl Command

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

### <a name="init"></a>initialize (aliases: i, init)

Sets up the project. Can also be run to update a project to the latest angular-librarian configuration.

#### Call signature

```shell
ngl i
ngl init
ngl initialize
npm run g i
npm run g init
npm run g initialize
```

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


### <a name="component"></a>component (alias: c)

Generates a component

#### Call signatures

```shell
ngl c
ngl component <selector>
npm run g c
npm run g component <selector>
```

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

### <a name="directive"></a>directive (alias: d)

Generates a directive

#### Call signatures

```shell
ngl d
ngl directive <directive-name>
npm run g d
npm run g directive <directive-name>
```

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

### <a name="service"></a>service (alias: s)

Generates a service

#### Call signatures

```shell
ngl s
ngl service <service-name>
npm run g s
npm run g service <service-name>
```

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

### <a name="pipe"></a>pipe (alias: p)

Generates a pipe

#### Call signatures

```shell
ngl p
ngl p <pipe-name>
npm run g p
npm run g p <pipe-name>
```

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

## <a name="project-commands"></a>Project Commands

There are commands provided out of the box, as NPM scripts. They are:

Command     | Purpose
---         | ---
[build](#build) | Runs code through build process via Angular compiler (ngc)
[lint](#lint) | Verify code matches linting rules
[publish](#publish) | Creates tag for new version and publishes
[serve](#serve) | Run Webpack's dev-server on project
[test](#test) | Execute unit tests

### <a name="build"></a>build (alias: b)

Build the library's code. This will run the code through
the `ngc` compiler and compile the code for distribution.

#### Call signatures

```shell
ngl build
ngl b
npm run build
```

### <a name="lint"></a>lint (alias: l)

Lint code through TSLint

#### Call signatures

```shell
ngl lint
ngl l
npm run lint
```

### <a name="publish"></a>publish (alias: p)

Create a tag and publish the library code using the
[`np` library](https://github.com/sindresorhus/np). Note that the `version`
argument utilizes the `version` arguments of the `np` library.

#### Call signatures

```shell
ngl publish <version>
ngl pub <version>
npm run tagVersion <version>
```

### <a name="serve"></a>serve (alias: v)

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

### <a name="test"></a>test (alias: t)

Run unit tests on code. For unit test types, see the
[unit testing](#unit) section below.

#### Call signatures

```shell
ngl test <type>
ngl t <type>
npm test <type>
```

### <a name="unit"></a>Unit Testing

Unit testing is done using Karma and Webpack. The setup is all done during the `initialize` command.
The provided testing commands will watch your files for changes.

The two following command is provided by default:

```shell
ngl test
ngl t
npm test
```

This command calls the script at `tasks/test.js` and runs the Karma test runner to execute the tests.
Prior to running Karma, the `test` command looks for a command line argument, if the argument is known,
it will run the associated configuration, otherwise it will run the default configuration.

Configurations:

Command | Testing TypeScript
---     | ---
default | Run through Chrome & PhantomJS with files being watched & tests automatically re-run
headless| Run through PhantomJS with files being watched & tests automatically re-run
single  | Run through PhantomJS one time with no file watching
watch   | Run through Chrome with files being watched & tests automatically re-run

Note that Chrome still requires a manual refresh on the Debug tab to see updated test results.

### <a name="pack"></a>Packaging

To test your packages output before publishing, you can run the specified publish
commands above.

```shell
npm pack
```

Which will generate a compressed file containing your library as it will look when packaged up and published to NPM. The basic structure of a published library is:

```
|__dist/
   |__index.d.ts
   |__index.js
   |__index.js.map
   |__index.metadata.json
   |__<library name>.bundle.js
   |__<library name>.bundle.js.map
   |__<library name>.module.d.ts
   |__<library name>.module.js
   |__<library name>.module.js.map
   |__<library name>.module.metadata.json
|__examples/
   |__example.component.html
   |__example.component.ts
   |__example.main.ts
   |__example.module.ts
   |__index.html
|__package.json
|__README.md
```

As you can see, the packaging removes any files specific to developing your
library. It, more importantly, creates distribution files for usage with many
different module systems.

## <a name="contribute"></a>Contributing

If you'd like to contribute to `angular-librarian`, please see the
[contributing guide](CONTRIBUTING.md)!
