'use strict';

const erector = require('erector-set');
const path = require('path');
const utilities = require('../utilities');

module.exports = (rootDir, selector) => {
    if (utilities.checkIsDashFormat(selector)) {
        createWithKnownSelector(rootDir, selector);
    } else {
        createWithMissingSelector(rootDir);
    }
};

const createWithKnownSelector = (rootDir, selector) => {
    const knownAnswers = [
        { answer: selector, name: 'selector' },
        { answer: utilities.dashToCap(selector) + 'Component', name: 'componentName' }
    ];
    const questions = getComponentOptionQuestions(knownAnswers);

    erector.inquire(questions).then((answers) => {
        erector.construct(knownAnswers.concat(answers), getFiles(rootDir), true);
    });
};

const getComponentOptionQuestions = (knownAnswers) => [
    { allowBlank: true, name: 'styles', question: 'Use inline styles (y/N)?', transform: utilities.createYesNoValue('n', knownAnswers, setInlineStyles) },
    { allowBlank: true, name: 'template', question: 'Use inline template (y/N)?', transform: utilities.createYesNoValue('n', knownAnswers, setInlineTemplate) },
    { name: 'styleAttribute', useAnswer: 'styles', transform: pickStyleAttribute },
    { name: 'templateAttribute', useAnswer: 'template', transform: pickTemplateAttribute }
].concat(getLifecycleHookQuestions());

const setInlineStyles = (value, answers) => {
    const selector = answers.find((answer) => answer.name === 'selector');

    return value ? '``' : `'./${selector.answer}.component.scss'`;
};

const setInlineTemplate = (value, answers) => {
    const selector = answers.find((answer) => answer.name === 'selector');

    return value ? '``' : `'./${selector.answer}.component.html'`;
};

const pickStyleAttribute = (value) => {
    let attribute = 'Urls';

    if (value === '``') {
        attribute = 's';
    }

    return 'style' + attribute;
};

const pickTemplateAttribute = (value) => {
    let attribute = 'Url';

    if (value === '``') {
        attribute = '';
    }

    return 'template' + attribute;
};

const getLifecycleHookQuestions = () => [
    { allowBlank: true, name: 'hooks', question: 'Lifecycle hooks (comma-separated):', transform: setLifecycleHooks },
    { name: 'implements', useAnswer: 'hooks', transform: setLifecycleImplements },
    { name: 'lifecycleNg', useAnswer: 'hooks', transform: setLifecycleMethods }
];

const setLifecycleHooks = (value) => {
    const hooks = value.split(',')
        .map(getHookName)
        .filter((hook) => !!hook);
    const comma = ', ';

    if (hooks.length > 0) {
        value = comma + hooks.join(comma);
    } else {
        value = '';
    }

    return value;
};

const getHookName = (hook) => {
    hook = hook.trim().toLowerCase();

    switch (hook) {
        case 'changes':
        case 'onchanges':
            return 'OnChanges';
        case 'check':
        case 'docheck':
            return 'DoCheck';
        case 'destroy':
        case 'ondestroy':
            return 'OnDestroy';
        case 'init':
        case 'oninit':
            return 'OnInit';
    }
};

const setLifecycleImplements = (value) => {
    let implementers = '';

    if (value.length > 0) {
        implementers = ` implements ${value.replace(/^, /, '')}`;
    }

    return implementers;
};

const setLifecycleMethods = (value) => {
    let methods = '\n';

    if (value) {
        methods = value.replace(/^, /, '').split(',').reduce((result, method) =>
            `${result}\n    ng${method.trim()}() {\n    }\n`,
        methods );
    }

    return methods;
};

const getFiles = (rootDir) => {
    const componentDir = path.resolve(rootDir, 'src', '{{ selector }}');

    return utilities.getTemplates(rootDir, __dirname, [
        {
            destination: path.resolve(componentDir, '{{ selector }}.component.ts'),
            name: 'app.ts'
        },
        {
            destination: path.resolve(componentDir, '{{ selector }}.component.spec.ts'),
            name: 'spec.ts'
        },
        {
            blank: true,
            check: checkForStylesFile,
            destination: path.resolve(componentDir, '{{ selector }}.component.scss')
        },
        {
            blank: true,
            check: checkForTemplateFile,
            destination: path.resolve(componentDir, '{{ selector }}.component.html')
        }
    ]);
};

const checkForStylesFile = (answers) => !checkIsInline(answers, 'styles');
const checkForTemplateFile = (answers) => !checkIsInline(answers, 'template');
const checkIsInline = (answers, type) => {
    const answer = answers.find((answer) => answer.name === type);

    return answer.answer === '``';
}