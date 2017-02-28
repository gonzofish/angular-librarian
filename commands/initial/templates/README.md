# {{ readmeTitle }}

## Tasks

The following commands are available through `npm run`:

Command     | Purpose
---         | ---
build       | Runs code through build process via Angular compiler (ngc)
g           | Generate code files (see above)
lint        | Verify code matches linting rules
start       | Run Webpack's dev-server on project (can be run as `npm start`)
[test](#unit)        | Execute unit tests (can be run as `npm test <type>`)
tagVersion  | Creates tag for new version and publishes

### <a name="unit"></a>Unit Testing

Unit testing is done using Karma and Webpack. The setup is all done during the `initialize` command.
The provided testing commands will watch your files for changes.

The two following command is provided by default:

```shell
npm test <type>
```

This command calls the script at `tasks/test.js` and runs the Karma test runner to execute the tests.
Prior to running Karma, the `test` command looks for a command line argument, if the argument is known,
it will run the associated configuration, otherwise it will run the default configuration.

#### Configurations

Type | Testing TypeScript
---     | ---
default | Run through PhantomJS one time with no file watching
all     | Run through Chrome & PhantomJS with files being watched & tests automatically re-run
headless| Run through PhantomJS with files being watched & tests automatically re-run
watch   | Run through Chrome with files being watched & tests automatically re-run

Note that Chrome still requires a manual refresh on the Debug tab to see updated test results.

### <a name="pack"></a>Packaging

Packaging is as simple as publishing to NPM by doing

```shell
npm run tagVersion
```

To test your packages output before publishing, you can run

```shell
npm pack
```

Which will generate a compressed file containing your library as it will look when packaged up and
published to NPM. The basic structure of a published library is:

```
|__examples/
   |__example.component.html
   |__example.component.ts
   |__example.main.ts
   |__example.module.ts
   |__index.html
|__src/
   |__{{ name }}.module.ts
   |__index.ts
|__.npmignore
|__index.ts
|__package.json
|__README.md
```

As you can see, the packaging removes any files specific to developing your library.
