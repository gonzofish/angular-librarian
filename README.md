# angular-library-set
An Angular 2+ scaffolding setup using
[erector-set](https://github.com/gonzofish/erector-set). The intention was to
keep creation of an Angular 2+ library as simple and concise as possible.

## Usage

Install this package to your project:

```shell
npm i -D angular-library-set
```

Then add it as the "g" command in your `package.json`:

```json
{
    "scripts": {
        "g": "node ./node_modules/angular-library-set"
    }
}
```

Then initialize your project:

```shell
> npm run g i

Library name: my-lib
README Title: My Library
Repository URL: https://github.com/me/my-lib
Reinitialize Git project (y/N)?
Installing Node modules
...NPM install occurs
Node modules installed
```

## Commands

All commands are run by doing:

```shell
npm run g <command_name> [<args>]
```

Note that all arguments are optional.

### initialize (aliases: i, init)

Setups the project

#### Call signature

```shell
npm run g i
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
|__webpack/
   |__webpack.dev.js
   |__webpack.test.js
|__.gitignore
|__.npmignore
|__index.ts
|__karma.conf.js
|__package.json
|__README.md
|__test.ts
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
- `src/<librar name>.module.ts`: the main module of the library
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


### component (alias: c)

Generates a component

#### Call signatures

```shell
npm run g c
npm run g c <selector>
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

### service (alias: s)

Generates a service

#### Call signatures

```shell
npm run g s
npm run g s <service-name>
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

### pipe (alias: p)

Generates a pipe

#### Call signatures

```shell
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

### Unit Testing

### Packaging