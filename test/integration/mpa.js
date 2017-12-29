/**
 * @file TestCase for MPA
 * @author panyuqi@baidu.com (panyuqi)
 */

import {join} from 'path';
import test from 'ava';
import LavasCore from '../../dist/core';

import {syncConfig, isKoaSupport, request, createApp} from '../utils';

let app;
let server;
let port = process.env.PORT || 3000;
let core;
let res;

test.beforeEach('init lavas-core & server', async t => {
    core = new LavasCore(join(__dirname, '../fixtures'));
    app = createApp();
});

test.afterEach('clean', t => {
    server && server.close();
});

test.serial('it should run in development mode correctly', async t => {
    await core.init('development', true);

    // switch to MPA mode
    core.config.entry[0].ssr = false;
    syncConfig(core, core.config);

    await core.build();

    // set middlewares & start a server
    app.use(isKoaSupport ? core.koaMiddleware() : core.expressMiddleware());
    server = app.listen(port);

    // serve main.html
    let skeletonContent = `<div data-server-rendered=true class=skeleton-wrapper data-v-aa10c5fc><header class=skeleton-header data-v-aa10c5fc></header>`
    res = await request(app)
        .get('/main.html');
    t.is(200, res.status);
    // include skeleton
    t.true(res.text.indexOf(skeletonContent) > -1);

//     // serve /skeleton-main in dev mode
//     res = await request(app)
//         .get('/skeleton-main');
//     t.is(200, res.status);
//     t.true(res.text.indexOf(skeletonContent) > -1);
//
//     // test nested route /parent/child1
//     let childPageTitle = '<title data-vue-meta="true">Child1</title>';
//     res = await request(app)
//         .get('/parent/child1');
//     t.is(200, res.status);
//     t.true(res.text.indexOf(ssrContent) > -1);
//     t.true(res.text.indexOf(childPageTitle) > -1);
//
//     // serve static assets such as manifest.json
//     res = await request(app)
//         .get('/static/manifest.json');
//     t.is(200, res.status);
//     t.true(res.text.startsWith(`{
//     "start_url": "/?utm_source=homescreen",
// `));
//
//     // render error page for invalid route path
//     let errorPageTitle = '<title data-vue-meta="true">服务器开小差了</title>';
//     res = await request(app)
//         .get('/invalid/path');
//     t.is(200, res.status);
//     t.true(res.text.indexOf(errorPageTitle) > -1);
});
