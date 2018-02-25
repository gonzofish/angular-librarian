'use strict';

const fs = require('fs');
const path = require('path');
const Server = require('karma').Server;

function run(type) {
    const config = getConfig(type);
    const server = new Server(config, function(exitCode) {
        process.exit(exitCode);
    });

    server.start();
}

function getConfig(options) {
	let config = getAllConfig(options.watch);
	config.browsers = options.browsers;
	config.singleRun = !options.watch;

	return config;
}

function parseOptions(args){
	return args.reduce((previous, arg)=>{
		const value = arg.match(/^(\w+)/)[1];
		let current = Object.assign({}, previous);
		switch(value){	//there are probably libraries that parse cmd line arguments...
			case 'headless':
			case 'hl':
			case 'h':
				current.browsers = ['PhantomJS'];
				break;
			case 'watch':
			case 'w':
				current.watch = true;
				break;
			case 'browsers':
			case 'b':
				let browsers = arg.match(/\w+=([\w,]*)/i);
				current.browsers = (browsers && !current.browsers) ? browsers[1].split(',') : current.browsers;
				break;
			//the 'all' option did not modify the browser options and it did not change the watch option.
			//therefore removing it will not break current setups. Unless the developer removed all browsers
			//from the base karma.config.js file
		}
		return current;
	}, {});
}

const getAllConfig = (watch) => ({
    configFile: path.resolve(__dirname, '..', 'karma.conf.js'),
    webpack: require(path.resolve(__dirname, '..', 'webpack', 'webpack.test.js'))(watch),
});

module.exports = run;

if (!module.parent) {
	//skip the first two args (exe and script) and grab all options that start with a 'word'
	let optionArgs = process.argv.filter((value, index) => index > 1 && value.match(/^\w+/));	
    run(parseOptions(optionArgs));
}
