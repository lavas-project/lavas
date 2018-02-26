/**
 * @file 全局集成测试
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {join} from 'path';
import test from 'ava';
import LavasCore from '../../dist';

import {isKoaSupport, request, createApp} from '../utils';

let app;
let server;
let port = process.env.PORT || 3000;
let core;

test.beforeEach('init lavas-core & server', async t => {
    core = new LavasCore(join(__dirname, '../fixtures/simple'));
    app = createApp();
});

test.afterEach('clean', async t => {
    await core.close();
    server && server.close();
});

async function runCommonTestCases(t) {
    // set middlewares & start a server
    app.use(isKoaSupport ? core.koaMiddleware() : core.expressMiddleware());
    server = app.listen(port, () => {
        console.log('server started at localhost:' + port);
    });

    // server side render index
    let ssrContent = '<div id="app" data-server-rendered="true">';
    let indexPageTitle = '<title data-vue-meta="true">Home</title>';
    // config.build.defines: {base: {}}
    let webpackDefineContent = 'test-var</span>';
    let res = await request(app)
        .get('/?a=1&b=2');
    t.is(200, res.status);
    t.true(res.text.indexOf(ssrContent) > -1);
    t.true(res.text.indexOf(indexPageTitle) > -1);
    t.true(res.text.indexOf(webpackDefineContent) > -1);

    // test nested route /parent/child1
    let childPageTitle = '<title data-vue-meta="true">Child1</title>';
    res = await request(app)
        .get('/parent/child1');
    t.is(200, res.status);
    t.true(res.text.indexOf(ssrContent) > -1);
    t.true(res.text.indexOf(childPageTitle) > -1);

    // serve static assets such as manifest.json
    res = await request(app)
        .get('/static/manifest.json');
    t.is(200, res.status);
    t.true(res.text.startsWith(`{
    "start_url": "/?utm_source=homescreen",
`));

    // render error page for invalid route path
    let errorPageTitle = '<title data-vue-meta="true">服务器开小差了</title>';
    res = await request(app)
        .get('/invalid/path');
    t.is(200, res.status);
    t.true(res.text.indexOf(errorPageTitle) > -1);
}

test.serial('it should run in development mode correctly', async t => {
    // init, build and start a dev server
    await core.init('development', true);
    await core.build();

    await runCommonTestCases(t);
});

test.serial('it should run in production mode correctly', async t => {
    // build in production mode
    await core.init('production', true);
    await core.build();

    // start server in production mode
    core = new LavasCore(join(__dirname, '../fixtures/simple/dist'));
    await core.init('production');
    await core.runAfterBuild();

    await runCommonTestCases(t);
});
