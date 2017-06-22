'use strict';

const commands = require('./commands');
const inquire = require('erector-set').inquire;

const main = (cliArgs) => {
    const command = getCommandName(cliArgs[0]);
    const commandArgs = cliArgs.slice(command === 'npm' ? 0 : 1);
    const rootDir = process.cwd();

    if (typeof commands[command] === 'function') {
        commands[command].apply(null, [rootDir].concat(commandArgs));
    } else {
        askForCommand();
    }
};

const getCommandName = (command) => {
    command = command ? command.replace(/^\-+/, '') : command;

    switch (command) {
        case 'b':
        case 'build':
        case 'l':
        case 'lint':
        case 'pub':
        case 'publish':
        case 'serve':
        case 't':
        case 'test':
        case 'v':
            return 'npm';
        case 'c':
        case 'component':
            return 'component';
        case 'd':
        case 'directive':
            return 'directive';
        case 'i':
        case 'init':
        case 'initial':
            return 'initial';
        case 'p':
        case 'pipe':
            return 'pipe';
        case 's':
        case 'service':
            return 'service';
        default:
            return '';
    }
};

const askForCommand = () => {
    inquire([{
        name: 'command',
        question: 'What would you like to generate?'
    }])
    .then((answers) => main(answers[0].answer.split(/\s+/)));
};

if (!module.parent) {
    main(process.argv.slice(2));
}
