# Getting the CLI Accessible

Since the `ngl` command is installed locally to each project, it is _not_
immediately available from the command line. To make it available, the command
can be aliased for your environment.

## *nix Environments

To add a persistent `ngl` command to your *nix environment, open up your `*rc`
file (ie, `.zshrc`, `.bashrc`) and add the following:

```shell
alias ngl=$(npm bin)/ngl
```

## Windows Environments

Windows is a bit trickier to add the command. To do so, create a `.cmd` file
somewhere on your system, such as `aliases.cmd`. Any future aliases you wish to
have can also be added to this file.

Once created add the following:

```shell
@echo off

DOSKEY ngl=node_modules\.bin\ngl $*
```

Think of `DOSKEY` as analogous to `alias` in *nix environments. The issue left
is that opening a command prompt won't run this alias command file like a
`.bashrc` or `.zshrc` is run when those prompts start up.

To get around this, add command line arguments to execute the `.cmd` file for
your terminal program using

```shell
cmd /k <location of .cmd>
```

Below are examples of getting this working with a couple different terminals.

### ConEmu & cmder

In the two most popular terminal emulators, ConEmu and cmder, this can be done
by opening up the settings, navigating to Startup > Tasks selecting the task to
run a command prompt (usually named `{cmd}`) and changing the startup command
from:

```shell
cmd.exe /k <existing arguments>
```

to

```shell
cmd.exe /k <location of .cmd> & <existing arguments>
```

For example, if the aliases file is at `C:\Users\me\my-aliases.cmd` and the
current task is:

```shell
cmd /k "%ConEmuDir% \..\init.bat" -new_console:d%USERPROFILE%
```

The updated task would be:

```shell
cmd /k C:\Users\me\my-aliases.cmd & "%ConEmuDir% \..\init.bat" -new_console:d%USERPROFILE%
```

### cmd

The same effect can be achieved by using the default command-line tool, `cmd`.
To do so, just follow the below steps:

1. Create a shortcut, anywhere on your system.
2. Right-click the shortcut, click Properties
3. In the "Target" field, change the command to:
```shell
cmd /k <location of .cmd>
```

Using the example above, the shortcut command would be:

```shell
cmd /k C:\Users\me\my-aliases.cmd
```

In the future, when opening a command prompt, use this shortcut to have access
to `ngl`!