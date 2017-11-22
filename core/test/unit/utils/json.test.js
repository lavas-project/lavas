/**
 * @file test case for utils/json.js
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {stringify, parse} from '../../../lib/utils/json';
import test from 'ava';

test('it should parse & stringify JSON with regexp', async t => {
    let json = {
        name: 'test',
        regExp: /^\/test/,
        nested: {
            subName: 'test-nested',
            regExp: /^\/test-nested$/
        },
    };

    t.deepEqual(json, parse(stringify(json)));
});
