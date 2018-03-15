/**
 * @file 全局集成测试
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {join} from 'path';
import test from 'ava';
import {readFile, writeFile, copy, remove} from 'fs-extra';
import LavasCore from '../../core';

import {syncConfig, isKoaSupport, request, createApp, makeTempDir} from '../utils';

test.beforeEach('init lavas-core & server', async t => {
    // copy fixture to temp dir
    let tempDir = await makeTempDir();
    await copy(join(__dirname, '../fixtures/simple'), tempDir);

    t.context.tempDir = tempDir;
    t.context.core = new LavasCore(tempDir);
    t.context.app = createApp();
});

test.afterEach.always('clean', async t => {
    let {core, server, tempDir} = t.context;

    await core.close();
    server && server.close();

    // clean temp dir
    await remove(tempDir);
});

async function runCommonTestCases(t) {
    let {core, app} = t.context;
    let res;
    // set middlewares & start a server
    app.use(isKoaSupport ? core.koaMiddleware() : core.expressMiddleware());
    t.context.server = app.listen();

    // server side render index
    let ssrContent = '<div id="app" data-server-rendered="true">';
    let indexPageTitle = '<title data-vue-meta="true">Home</title>';
    // config.build.defines: {base: {}}
    let webpackDefineContent = 'test-var</span>';
    res = await request(app)
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
}

test('it should run in development mode correctly', async t => {
    let core = t.context.core;
    // init, build and start a dev server
    await core.init('development', true);
    await core.build();

    await runCommonTestCases(t);
});

test('it should run in production mode correctly', async t => {
    let {core, tempDir} = t.context;
    // build in production mode
    await core.init('production', true);

    // disable stats
    core.config.build.stats = false;
    syncConfig(core, core.config);

    await core.build();

    // start server in production mode
    core = new LavasCore(join(tempDir, 'dist'));
    await core.init('production');
    await core.runAfterBuild();

    // update new core in context
    t.context.core = core;

    await runCommonTestCases(t);
});
