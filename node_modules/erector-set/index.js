'use strict';

const construct = require('./construct');
const inquire = require('./inquire');

const build = (questions, templates, overwrite) => {
    const promise = inquire(questions);

    promise.then((answers) => construct(answers, templates, !!overwrite));

    return promise;
};

module.exports = {
    build: build,
    construct: construct,
    inquire: inquire
};