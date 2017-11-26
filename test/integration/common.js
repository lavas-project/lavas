/**
 * @file 全局集成测试
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {join} from 'path';
import test from 'ava';
import LavasCore from '../../dist/core';
import Koa from 'koa';
import superkoa from 'superkoa';
import {syncConfig} from '../utils';

let app;
let server;
let port = process.env.PORT || 3000;
let core;

test.beforeEach('init lavas-core & koa', async t => {
    core = new LavasCore(join(__dirname, '../fixtures'));
    app = new Koa();
});

test.afterEach('clean', t => {
    server.close();
});

test('it should run in development mode correctly', async t => {

    // init, build and start a server
    await core.init('development', true);
    await core.build();
    app.use(core.koaMiddleware());
    server = app.listen(port, () => {
        console.log('server started at localhost:' + port);
    });

    // server side render index
    let ssrContent = '<div id="app" data-server-rendered="true">';
    let indexPageTitle = '<title data-vue-meta="true">Home</title>';
    let res = await superkoa(app)
        .get('/');
    t.is(200, res.status);
    t.true(res.text.indexOf(ssrContent) > -1);
    t.true(res.text.indexOf(indexPageTitle) > -1);

    // test nested route /parent/child1
    let childPageTitle = '<title data-vue-meta="true">Child1</title>';
    res = await superkoa(app)
        .get('/parent/child1');
    t.is(200, res.status);
    t.true(res.text.indexOf(ssrContent) > -1);
    t.true(res.text.indexOf(childPageTitle) > -1);

    // serve static assets such as manifest.json
    let manifestContent = core.config.manifest;
    res = await superkoa(app)
        .get('/static/manifest.json');
    t.is(200, res.status);
    t.is(res.text, JSON.stringify(manifestContent));

    // render error page for invalid route path
    let errorPageTitle = '<title data-vue-meta="true">服务器开小差了</title>';
    res = await superkoa(app)
        .get('/invalid/path');
    t.is(200, res.status);
    t.true(res.text.indexOf(errorPageTitle) > -1);
});
