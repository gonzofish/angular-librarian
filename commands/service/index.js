'use strict';

const erector = require('erector-set');
const path = require('path');

const utilities = require('../utilities');

module.exports = (rootDir, name) => {
    const templates = getTemplates(rootDir);

    if (checkHasName(name)) {
        erector.construct([
            { name: 'filename', answer: name},
            { name: 'serviceName', answer: utilities.dashToCap(name) + 'Service' }
        ], templates, true);
    } else {
        erector.build(getAllQuestions(), templates);
    }
};

const checkHasName = (name) =>
    name && name.trim().length > 0;

const getTemplates = (rootDir) => {
    const servicesDir = path.resolve(rootDir, 'src', 'services');

    return utilities.getTemplates(rootDir, __dirname, [
        {
            destination: path.resolve(servicesDir, '{{ filename }}.service.ts'),
            name: 'app.ts'
        },
        {
            destination: path.resolve(servicesDir, '{{ filename }}.service.spec.ts'),
            name: 'spec.ts'
        }
    ]);
};

const getAllQuestions = () => [
    {
        name: 'filename',
        question: 'Service name:', transform: (value) => {
            if (!utilities.checkIsDashFormat(value)) {
                value = null;
            }

            return value;
        }
    },
    {
        name: 'serviceName',
        transform: (value) => utilities.dashToCap(value) + 'Service',
        useAnswer: 'filename'
    }
];