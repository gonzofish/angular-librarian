'use strict';

const erector = require('erector-set');
const logging = require('../../tools/logging');
const path = require('path');
const utilities = require('../utilities');

const caseConvert = utilities.caseConvert;
const colorize = utilities.colorize;
const files = utilities.files;
const inputs = utilities.inputs;
const opts = utilities.options;
let logger;

module.exports = function createComponent(rootDir, selector) {
    logger = logging.create('Component');

    const options = opts.parseOptions(Array.from(arguments).slice(selector && selector[0] !== '-' ? 2 : 1), [
        'default', 'defaults', 'd',
        'example', 'examples', 'x',
        'hooks', 'h',
        'inline-styles', 'is',
        'inline-template', 'it'
    ]);
    const forExamples = opts.checkIsForExamples(options);
    const templates = getTemplates(rootDir, forExamples);
    const remaining = getRemainingQuestions(selector, options);
    const knownAnswers = remaining.answers;
    const questions = remaining.questions.reduce((all, method) => all.concat(method(knownAnswers)), []);

    return erector.inquire(questions).then((answers) => {
        const allAnswers = knownAnswers.concat(answers);

        erector.construct(allAnswers, templates);
        notifyUser(allAnswers, forExamples);
    }).catch((error) => logger.error(colorize.colorize(error.message, 'red')));
};

const getRemainingQuestions = (selectorName, options) => {
    const all = [
        getKnownSelector(selectorName),
        getKnownStyle(options),
        getKnownTemplate(options),
        getKnownLifecycleHooks(options)
    ];

    return all.reduce((groups, part) => {
        if (part.answers) {
            groups.answers = groups.answers.concat(part.answers);
        } else if (part.questions) {
            groups.questions = groups.questions.concat(part.questions);
        }

        return groups;
    }, { answers: [], questions: []});
};

const getKnownSelector = (selector) => {
    if (utilities.checkIsDashFormat(selector)) {
        return {
            answers: [
                { answer: selector, name: 'selector' },
                { answer: utilities.dashToCap(selector) + 'Component', name: 'componentName' }
            ]
        };
    } else {
        return {
            questions: getSelectorQuestions
        };
    }
};

const getSelectorQuestions = () => [
    { name: 'selector', question: 'What is the component selector (in dash-case)?', transform: (value) => caseConvert.checkIsDashFormat(value) ? value : null },
    { name: 'componentName', transform: (value) => utilities.dashToCap(value) + 'Component', useAnswer: 'selector' }
];

const getKnownStyle = (options) => {
    const keys = Object.keys(options);

    if (keys.indexOf('is') === -1 && keys.indexOf('inline-styles') === -1) {
        return {
            questions: getStyleQuestions
        };
    } else {
        return {
            answers: [
                { answer: setInlineStyles(true, []), name: 'styles' },
                { answer: pickStyleAttribute(``), name: 'styleAttribute' }
            ]
        }
    }
};

const getStyleQuestions = (knownAnswers) => [
    { allowBlank: true, name: 'styles', question: 'Use inline styles (y/N)?', transform: inputs.createYesNoValue('n', knownAnswers, setInlineStyles) },
    { name: 'styleAttribute', useAnswer: 'styles', transform: pickStyleAttribute }
];

const getKnownTemplate = (options) => {
    const keys = Object.keys(options);

    if (keys.indexOf('it') === -1 && keys.indexOf('inline-template') === -1) {
        return {
            questions: getTemplateQuestions
        };
    } else {
        return {
            answers: [
                { answer: setInlineTemplate(true, []), name: 'template' },
                { answer: pickTemplateAttribute(``), name: 'templateAttribute' }
            ]
        }
    }
};

const getTemplateQuestions = (knownAnswers) => [
    { allowBlank: true, name: 'template', question: 'Use inline template (y/N)?', transform: utilities.createYesNoValue('n', knownAnswers, setInlineTemplate) },
    { name: 'templateAttribute', useAnswer: 'template', transform: pickTemplateAttribute }
];

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

const getKnownLifecycleHooks = (options) => {
    const keys = Object.keys(options);

    if (keys.indexOf('h') === -1 && keys.indexOf('hooks') === -1) {
        return {
            questions: getLifecycleHookQuestions
        };
    } else {
        const hooks = setLifecycleHooks((options.h || options.hooks).join(','));
        return {
            answers: [
                { answer: hooks, name: 'hooks' },
                { answer: setLifecycleImplements(hooks), name: 'implements' },
                { answer: setLifecycleMethods(hooks), name: 'lifecycleNg' }
            ]
        };
    }
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

const getTemplates = (rootDir, forExamples) => {
    const codeDir = forExamples ? 'examples' : 'src';
    const componentDir = path.resolve(rootDir, codeDir, '{{ selector }}');

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

const notifyUser = (answers, forExamples) => {
    const componentName = answers.find((answer) => answer.name === 'componentName');
    const moduleLocation = forExamples ? 'examples/example' : 'src/*';
    const selector = answers.find((answer) => answer.name === 'selector');

    console.info(`\nDon't forget to add the following to the ${ moduleLocation }.module.ts file:`);
    console.info(`    import { ${componentName.answer} } from './${selector.answer}/${selector.answer}.component';`);
    console.info(`And to add ${componentName.answer} to the NgModule declarations list`);
};
