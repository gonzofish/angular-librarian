'use strict';

const path = require('path');

module.exports = (filename) =>
    require(
        filename.replace(path.sep + 'test', '')
            .replace('.spec', '')
    );