'use strict';

const sinon = require('sinon');
const tap = require('tap');

const options = require('../../resolver')(__filename);

tap.test('#checkIsForExamples', (test) => {
    const check = options.checkIsForExamples;

    test.plan(5);

    test.notOk(check({ apple: [], broccoli: [] }));
    test.ok({ example: [] });
    test.ok({ examples: [] });
    test.ok({ x: [] });
    test.ok(check({ apple: [], examples: [] }));

    test.end();
});

tap.test('#parseOptions', (suite) => {
    const parse = options.parseOptions;
    // --this is an option -> this: [is, an, option]
    // -its -> { i: [], t: [], s: [] }
    // --word=arguments,two -> word: [arguments, two]

    suite.test('should split a single-dash argument into multiple options', (test) => {
        test.plan(1);

        test.deepEqual(parse(['-abc']), {
            a: [],
            b: [],
            c: []
        });

        test.end();
    });

    suite.test('should save double-dash arguments as a single option', (test) => {
        test.plan(1);

        test.deepEqual(parse(['-abc', '--pizza']), {
            a: [],
            b: [],
            c: [],
            pizza: []
        });

        test.end();
    });

    suite.test('should store comma-delimited arguments passed to double-dash after =', (test) => {
        test.plan(1);

        test.deepEqual(parse(['-abc', '--pizza=pepperoni,mushroom']), {
            a: [],
            b: [],
            c: [],
            pizza: ['pepperoni', 'mushroom']
        });

        test.end();
    });

    suite.test('should store space-delimited arguments provided after double-dash', (test) => {
        const candidates = [
            'nope', // will not be added
            '-abc',
            'notthis', // also won't be added
            '--pizza', '', 'pepperoni', 'mushroom',
            '--burger=cheese'
        ];
        test.plan(1);

        test.deepEqual(parse(candidates), {
            a: [],
            b: [],
            burger: ['cheese'],
            c: [],
            pizza: ['pepperoni', 'mushroom']
        });

        test.end();
    });

    suite.test('should convert primitives to their actual values (eg, true should be a boolean)', (test) => {
        const candidates = [
            'nope', // will not be added
            '-abc',
            'notthis', // also won't be added
            '--eat=true', 'false',
            '--orders=12',
            '--pizza', '', 'pepperoni', 'mushroom',
            '--burger=cheese'
        ];
        test.plan(1);

        test.deepEqual(parse(candidates), {
            a: [],
            b: [],
            burger: ['cheese'],
            c: [],
            eat: [true, false],
            orders: [12],
            pizza: ['pepperoni', 'mushroom']
        });

        test.end();
    });

    suite.test('should not store arguments if a they are not in the provided valid set', (test) => {
        const candidates = [
            'nope',
            '-abc',
            '--unknown', 'pow', 'how',
            '--pizza=pepperoni,mushroom,true'
        ];
        const valid = ['a', 'b', 'c', 'pizza'];
        test.plan(1);

        test.deepEqual(parse(candidates, valid), {
            a: [],
            b: [],
            c: [],
            pizza: ['pepperoni', 'mushroom', true]
        });

        test.end();
    })

    suite.end();
});
