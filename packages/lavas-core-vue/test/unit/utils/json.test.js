/**
 * @file test case for utils/json.js
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {stringify, parse, deepPick} from '../../../core/utils/json';
import test from 'ava';

test('it should parse & stringify JSON with regexp', async t => {
    let json = {
        name: 'test',
        regExp: /^\/test/,
        nested: {
            subName: 'test-nested',
            regExp: /^\/test-nested$/
        }
    };

    t.deepEqual(json, parse(stringify(json)));
});

test('it should deep pick object correctly', async t => {
    let input = {
        one: 1,
        two: true,
        three: 'Three',
        four: [1, 2, 3, 4],
        five: {
            alpha: 1,
            beta: 2,
            gamma: 3,
            teta: {
                alef: 1,
                beh: 2,
                peh: 3
            }
        },
        answer: '42.00',
        description: 'This is an object.'
    };

    let schema = {
        one: true,
        three: true,
        four: [true],
        five: {
            alpha: true,
            teta: {
                beh: true
            }
        }
    };

    t.is(
        JSON.stringify(deepPick(input, schema)),
        '{"one":1,"three":"Three","four":[1,2,3,4],"five":{"alpha":1,"teta":{"beh":2}}}'
    );
});

