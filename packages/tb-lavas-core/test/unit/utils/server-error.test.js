/**
 * @file test case for middleware-composer.js
 * @author xtx1130@gmail.com <小菜>
 */

import test from 'ava';
import http from 'http';
import expressErrorFactory from '../../../core/middlewares/express-error';

function requestListenerNoRedrict(req, res) {
    expressErrorFactory({
        errorPath:'/',
        defaultErrorMessage: 'test',
        showRealErrorMessage: 'test-real'
    }).call(global, new Error('test'), req, res, function noop(){});
}

function requestListenerRedrict(req, res) {
    expressErrorFactory({
        errorPath:'/?error=1',
        defaultErrorMessage: 'test',
        showRealErrorMessage: 'test-real'
    }).call(global, new Error('test'), req, res, function noop(){});
}

const serverNoRedrict = http.createServer(requestListenerNoRedrict);
serverNoRedrict.listen('8999');

const serverRedrict = http.createServer(requestListenerRedrict);
serverRedrict.listen('8998');

test('Test for error middleware 404.', async t => {
    return new Promise((resolve, reject) => {
        let httpReq = http.request({
            host: 'localhost',
            port: 8999,
            path: '/'
        }, res => {
            t.is(res.statusCode, 404);
            serverNoRedrict.close();
            resolve();
        });
        httpReq.on('error', e => {
            t.is(e.message, 'test');
            serverNoRedrict.close();
            reject();
        });
        httpReq.end();
    });
});

test('Test for error middleware 302.', async t => {
    return new Promise((resolve, reject) => {
        let httpReq = http.request({
            host: 'localhost',
            port: 8998,
            path: '/'
        }, res => {
            t.is(res.statusCode, 302);
            serverRedrict.close();
            resolve();
        });
        httpReq.on('error', e => {
            t.is(e.message, 'test');
            serverRedrict.close();
            reject();
        });
        httpReq.end();
    });
});