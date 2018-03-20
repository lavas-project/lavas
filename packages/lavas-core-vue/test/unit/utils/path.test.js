/**
 * @file test case for utils/path.js
 * @author panyuqi (pyqiverson@gmail.com)
 */

import {distLavasPath, assetsPath, resolveAliasPath, isFromCDN, removeTrailingSlash, camelCaseToDash} from '../../../core/utils/path';
import {sep} from 'path';
import test from 'ava';

// distLavasPath()
test('it should concat path with lavas directory', t => {
    t.is(['', 'root', 'lavas', 'newpath'].join(sep), distLavasPath('/root', 'newpath'));
});

// assetsPath()
test('it should generate a relative path based on config', t => {
    t.is('static/js/[name].[hash].js', assetsPath('js/[name].[hash].js'));
});

// resolveAliasPath()
test('it should resolve path with webpack alias', t => {
    let alias = {
        '@': '/root'
    };
    t.is(['', 'root', 'components', 'a.vue'].join(sep), resolveAliasPath(alias, '@/components/a.vue'));
});

// isFromCDN()
test('it should test whether a path is from CDN', t => {
    let urlA = 'https://testA.cdn.com/';
    let urlB = 'http://testB.cdn.com/';
    let urlC = '//testC.cdn.com/';

    t.true(isFromCDN(urlA));
    t.true(isFromCDN(urlB));
    t.true(isFromCDN(urlC));
});

// removeTrailingSlash()
test('it should remove trailing slash correctly', t => {
    t.is('foo/bar', removeTrailingSlash('foo/bar/'));
    t.is('foo/bar', removeTrailingSlash('foo/bar'));
});

// camelCaseToDash()
test('it should transfer from camel case to dash', t => {
    t.is('camel-case-to-dash', camelCaseToDash('camelCaseToDash'));
    t.is('already-camel-case', camelCaseToDash('already-camel-case'));
});
