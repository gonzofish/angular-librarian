#! /usr/bin/env node
const path = require('path');
const spawn = require('child_process').spawn;

const cliArgs = Array.from(process.argv).slice(2);
const execDir = path.resolve(__dirname, '..');

spawn('node', [execDir].concat(cliArgs), { stdio: 'inherit' });