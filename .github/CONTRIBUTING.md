# Contributing to Angular Librarian

## How to Contribute

1. [Fork the repo](https://github.com/gonzofish/angular-librarian/fork)
2. Create a branch in your repo with a descriptive name (ie, if you were fixing
    and issue with unit test performance, `test-performance` would be
    descriptive enough)
3. Code your fix
4. [Create a pull request](https://github.com/gonzofish/angular-librarian/compare)
5. Await response from the maintainers!

## The Codebase

Angular Librarian is powered by the
[`erector-set` library](https://github.com/gonzofish/erector-set). Erector Set
provides a small interface to create scaffolding applications, like Angular
Librarian.

The flow of any command run through Angular Librarian goes like this:

1. User runs the command, which calls `index.js`
2. `index.js` parses the command, using `process.argv` (it takes commands from index
    2 on)
    1. The first command argument is the actual command, which is run through
        a switch. If the command is known, it returns the full name of the
        command (ie, `i` becomes `initial`).
    2. If no command is provided, Angular Librarian will ask what command to
        run.
3. `index.js` uses a lookup, provided by `commands/index.js`, for to access the
    the functions for provided commands. Each function is the `index.js` file
    for that command's folder under `commands`.
4. The remaining arguments are passed to the function for the specified
    command. Each command processes the provided arguments differently, as fits
    that command.
5. All commands take user-provided answers (or command arguments) plus a set of
    templates and create the actual files that become part of the scaffolded
    project.

For all commands, the templates will be in the `templates` directory of that
command's directory. The only exception is the `upgrade` command which pulls
its templates with from the `initial` command's `templates` directory.

For more assistance, feel free to [create an issue with
`[CONTRIBUTING]`](https://github.com/gonzofish/angular-librarian/issues/new?title=[CONTRIBUTING]%20) in the title.
