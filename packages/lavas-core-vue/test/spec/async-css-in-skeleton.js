/**
 * @file TestCase for #73
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

const asyncCSSContent = 'this.onload=null;this.rel=\'stylesheet\';window.STYLE_READY=1;';

test('it should not use async CSS in development mode when cssExtract is false', async t => {
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

    // should not generate async CSS content
    t.true(res.text.indexOf(asyncCSSContent) === -1);
});

test('it should use async CSS in production mode correctly', async t => {
    let {core} = t.context;
    await core.init('production', true);

    // switch to SPA mode
    core.config.build.ssr = false;
    // disable stats
    core.config.build.stats = false;
    syncConfig(core, core.config);

    await core.build();

    let htmlContent = await readFile(join(t.context.tempDir, 'dist/index.html'), 'utf8');

    // should generate async CSS content
    t.true(htmlContent.indexOf(asyncCSSContent) > -1);
});

test('it should not use async CSS in production mode when skeleton is disabled', async t => {
    let {core} = t.context;
    await core.init('production', true);

    // switch to SPA mode
    core.config.build.ssr = false;
    // disable skeleton
    core.config.skeleton.enable = false;
    // disable stats
    core.config.build.stats = false;
    syncConfig(core, core.config);

    await core.build();

    let htmlContent = await readFile(join(t.context.tempDir, 'dist/index.html'), 'utf8');

    // should generate async CSS content
    t.true(htmlContent.indexOf(asyncCSSContent) === -1);
});

test('it should not use async CSS in production mode when skeleton asyncCSS is disabled', async t => {
    let {core} = t.context;
    await core.init('production', true);

    // switch to SPA mode
    core.config.build.ssr = false;
    // enable skeleton but disable asyncCSS
    core.config.skeleton.asyncCSS = false;
    // disable stats
    core.config.build.stats = false;
    syncConfig(core, core.config);

    await core.build();

    let htmlContent = await readFile(join(t.context.tempDir, 'dist/index.html'), 'utf8');

    // should generate async CSS content
    t.true(htmlContent.indexOf(asyncCSSContent) === -1);
});

test('it should not use async CSS in production mode when core/entry-client.js is outdated.', async t => {
    let {core} = t.context;
    await core.init('production', true);

    // switch to SPA mode
    core.config.build.ssr = false;
    // disable stats
    core.config.build.stats = false;
    syncConfig(core, core.config);

    // modify entry-client.js
    // if entry-client.js doesn't contain `window.mountLavas`, we think it is outdated and won't
    // use async CSS.
    let entryClientPath = join(t.context.tempDir, 'core/entry-client.js');
    let originalContent = await readFile(entryClientPath, 'utf8');
    await writeFile(entryClientPath, originalContent.replace(/window\.mountLavas/g, 'func'), 'utf8');

    await core.build();

    let htmlContent = await readFile(join(t.context.tempDir, 'dist/index.html'), 'utf8');

    // should generate async CSS content
    t.true(htmlContent.indexOf(asyncCSSContent) === -1);

    // restore entry-client.js
    await writeFile(entryClientPath, originalContent, 'utf8');
});
