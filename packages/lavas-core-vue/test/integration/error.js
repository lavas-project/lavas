/**
 * @file TestCase for errorHandler
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {join} from 'path';
import test from 'ava';
import Koa from 'koa';
import rp  from 'request-promise';
import supertest from 'supertest';
import LavasCore from '../../core';
import koaError from '../../core/middlewares/koa-error';
import expressError from '../../core/middlewares/express-error';

import {syncConfig, isKoaSupport, createApp} from '../utils';

let koaApp = new Koa();
let expressApp;
let koaServer;
let expressServer;
let port = process.env.PORT || 3000;
let core;
let koaRes;
let expressRes;

test.before('init lavas-core & server', async t => {
    core = new LavasCore(join(__dirname, '../fixtures/simple'));
    expressApp = createApp(true);
});

test.after('clean', t => {
    koaServer && koaServer.close();
    expressServer && expressServer.close();
});

test('it should show error page correctly', async t => {
// test.serial('it should show error page correctly', async t => {
    await core.init('development', true);
    // switch to SPA mode
    // core.config.build.ssr = false;
    // syncConfig(core, core.config);

    await core.build();

    koaApp.use(koaError());
    koaServer = koaApp.listen(port);

    expressApp.use(expressError('/'));
    expressServer = expressApp.listen(3031);
    // serve main.html
    // let skeletonContent = `<div data-server-rendered=true class=skeleton-wrapper`
    try{
        koaRes = await rp({
            uri: 'http://localhost:'+ String(port) + '/some-page-not-exists',
            method: 'GET',
            resolveWithFullResponse: true
        });
    } catch(e) {
        if(e.message.match('404')){
            t.pass('404 code is ok!');
        }
    }
    expressRes = await supertest(expressApp)
        .get('/some-page-not-exists');
    t.is(404, expressRes.status);
    // t.is('what?', res.text);
    // include skeleton
    // t.true(res.text.indexOf(skeletonContent) > -1);
});
