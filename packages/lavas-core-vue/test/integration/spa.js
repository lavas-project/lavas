/**
 * @file TestCase for MPA
 * @author panyuqi@baidu.com (panyuqi)
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

test('it should run in development mode correctly', async t => {
    let {core, app} = t.context;
    let res;
    await core.init('development', true);

    // switch to SPA mode
    core.config.build.ssr = false;
    syncConfig(core, core.config);

    await core.build();

    // set middlewares & start a server
    app.use(isKoaSupport ? core.koaMiddleware() : core.expressMiddleware());
    t.context.server = app.listen();

    // serve main.html
    res = await request(app)
        .get('/index.html');
    t.is(200, res.status);

    // include skeleton
    let skeletonContent = '<div data-server-rendered=true>';
    t.true(res.text.indexOf(skeletonContent) > -1);
});

test('it should run in production mode correctly', async t => {
    let {core, app, tempDir} = t.context;
    let res;
    await core.init('production', true);

    // switch to SPA mode
    core.config.build.ssr = false;
    // disable stats
    core.config.build.stats = false;
    syncConfig(core, core.config);

    await core.build();

    let htmlContent = await readFile(join(tempDir, 'dist/index.html'), 'utf8');

    // include skeleton
    let skeletonContent = '<div data-server-rendered=true>';
    t.true(htmlContent.indexOf(skeletonContent) > -1);

    // include sw-register
    let swRegisterContent = '/sw-register.js?v=';
    t.true(htmlContent.indexOf(swRegisterContent) > -1);
});
