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

    const options = opts.parseOptions(Array.from(arguments).slice(hasSelector(selector) ? 2 : 1), [
        'default', 'defaults', 'd',
        'example', 'examples', 'x',
        'hooks', 'h',
        'inline-styles', 'is',
        'inline-template', 'it'
    ]);
    const useDefaults = opts.checkHasOption(options, ['default', 'defaults', 'd']);

    if (useDefaults) {
        return constructWithDefaults(rootDir, selector, options);
    } else {
        return inquire(rootDir, selector, options);
    }
};

const constructWithDefaults = (rootDir, selector, options) => {
    if (hasSelector(selector) && caseConvert.checkIsDashFormat(selector)) {
        const selectorAnswers = getKnownSelector(selector);
        const styleAnswers = getKnownStyle(false, selectorAnswers);
        const templateAnswers = getKnownTemplate(false, selectorAnswers);
        const lifecycleAnswers = getKnownLifecycleHooks('');

        const answers = selectorAnswers.concat(
            styleAnswers,
            templateAnswers,
            lifecycleAnswers
        );

        return Promise.resolve()
            .then(() => construct(answers, options));
    } else {
        return Promise.reject(
            'A dash-case selector must be provided when using defaults'
        );
    }
};

const hasSelector = (selector) => selector && selector[0] !== '-';

const inquire = (rootDir, selector, options) => {
    const remaining = getRemainingQuestions(selector, options);
    const knownAnswers = remaining.answers;
    const questions = remaining.questions.reduce((all, method) => all.concat(method(knownAnswers)), []);

    return erector.inquire(questions)
        .then((answers) => construct(knownAnswers.concat(answers), options));
};

const construct = (answers, options = {}) => {
    const forExamples = opts.checkIsForExamples(options);
    const templates = getTemplates(forExamples);
    const results = erector.construct(answers, templates);

    notifyUser(answers, forExamples);
    return results;
};

const getRemainingQuestions = (selectorName, options) => {
    const all = [
        getSelector(selectorName),
        getStyle(options),
        getTemplate(options),
        getLifecycleHooks(options)
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

const getSelector = (selector) => {
    if (utilities.checkIsDashFormat(selector)) {
        return { answers: getKnownSelector(selector) };
    } else {
        return {
            questions: getSelectorQuestions
        };
    }
};

const getKnownSelector = (selector) => [
    { answer: selector, name: 'selector' },
    { answer: utilities.dashToCap(selector) + 'Component', name: 'componentName' }
];

const getSelectorQuestions = () => [
    { name: 'selector', question: 'What is the component selector (in dash-case)?', transform: (value) => caseConvert.checkIsDashFormat(value) ? value : null },
    { name: 'componentName', transform: (value) => utilities.dashToCap(value) + 'Component', useAnswer: 'selector' }
];

const getStyle = (options) => {
    if (opts.checkHasOption(options, ['is', 'inline-styles'])) {
        return { answers: getKnownStyle(true, []) };
    } else {
        return {
            questions: getStyleQuestions
        };
    }
};

const getKnownStyle = (inline, answers = []) => {
    const selector = answers.find((answer) => answer.name === 'selector');

    return [
        { answer: setInlineStyles(inline, selector ? [selector] : []), name: 'styles' },
        { answer: pickStyleAttribute(selector ? selector.answer : ''), name: 'styleAttribute' }
    ];
};

const getStyleQuestions = (knownAnswers) => [
    { allowBlank: true, name: 'styles', question: 'Use inline styles (y/N)?', transform: inputs.createYesNoValue('n', knownAnswers, setInlineStyles) },
    { name: 'styleAttribute', useAnswer: 'styles', transform: pickStyleAttribute }
];

const getTemplate = (options) => {
    if (opts.checkHasOption(options, ['it', 'inline-template'])) {
        return { answers: getKnownTemplate(true, []) };
    } else {
        return {
            questions: getTemplateQuestions
        };
    }
};

const getKnownTemplate = (inline, answers = []) => {
    const selector = answers.find((answer) => answer.name === 'selector');

    return [
        { answer: setInlineTemplate(inline, selector ? [selector] : []), name: 'template' },
        { answer: pickTemplateAttribute(selector ? selector.answer : ''), name: 'templateAttribute' }
    ];
};

const getTemplateQuestions = (knownAnswers) => [
    { allowBlank: true, name: 'template', question: 'Use inline template (y/N)?', transform: inputs.createYesNoValue('n', knownAnswers, setInlineTemplate) },
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

const getLifecycleHooks = (options) => {
    if ((opts.checkHasOption(options, ['hooks']) && options.hooks.length > 0) ||
        (opts.checkHasOption(options, ['h']) && options.h.length > 0)) {
        return { answers: getKnownLifecycleHooks((options.h || options.hooks || '').join(',')) };
    } else {
        return { questions: getLifecycleHookQuestions };
    }
};

const getKnownLifecycleHooks = (hooks) => {
    hooks = setLifecycleHooks(hooks);

    return [
        { answer: hooks, name: 'hooks' },
        { answer: setLifecycleImplements(hooks), name: 'implements' },
        { answer: setLifecycleMethods(hooks), name: 'lifecycleNg' }
    ];
};

const getLifecycleHookQuestions = () => [
    { allowBlank: true, name: 'hooks', question: 'Lifecycle hooks (comma-separated):', transform: setLifecycleHooks },
    { name: 'implements', useAnswer: 'hooks', transform: setLifecycleImplements },
    { name: 'lifecycleNg', useAnswer: 'hooks', transform: setLifecycleMethods }
];

const setLifecycleHooks = (value = '') => {
    const hooksArray = value.split(',')
        .map(getHookName)
        .filter((hook) => !!hook);
    const hooks = [...new Set(hooksArray)];
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

const getTemplates = (forExamples) => {
    const codeDir = forExamples ? 'examples' : 'src';
    const componentDir = files.resolver.create(codeDir, '{{ selector }}');

    return files.getTemplates(files.resolver.root(), __dirname, [
        {
            destination: componentDir('{{ selector }}.component.ts'),
            name: 'app.ts'
        },
        {
            destination: componentDir('{{ selector }}.component.spec.ts'),
            name: 'spec.ts'
        },
        {
            blank: true,
            check: checkForStylesFile,
            destination: componentDir('{{ selector }}.component.scss')
        },
        {
            blank: true,
            check: checkForTemplateFile,
            destination: componentDir('{{ selector }}.component.html')
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

    logger.info(
        colorize.colorize(`Don't forget to add the following to the `, 'green'),
        `${ moduleLocation }.module.ts `,
        colorize.colorize('file:', 'green')
    );
    logger.info(colorize.colorize(`    import { ${componentName.answer} } from './${selector.answer}/${selector.answer}.component';`, 'cyan'));
    logger.info(
        colorize.colorize('And to add ', 'green'),
        `${componentName.answer} `,
        colorize.colorize('to the NgModule declarations list', 'green')
    );
};
