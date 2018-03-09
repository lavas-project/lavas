/**
 * @file TestCase for #43
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
    // clean temp dir
    await remove(tempDir);

    await core.close();
    server && server.close();
});

test('it should run in development mode correctly', async t => {
    let {core, app, tempDir} = t.context;
    let res;
    await core.init('development', true);

    // switch to SPA mode
    core.config.build.ssr = false;
    syncConfig(core, core.config);

    await core.build();

    // set middlewares & start a server
    app.use(isKoaSupport ? core.koaMiddleware() : core.expressMiddleware());
    t.context.server = app.listen();

    // serve index.html
    res = await request(app)
        .get('/index.html');
    t.is(200, res.status);

    // generate filenames without [hash]
    let clientMFS = core.builder.devMiddleware.fileSystem;
    let jsDir = join(tempDir, 'dist/static/js');
    let assets = [
        'index.js',
        'vue.js',
        'vendor.js',
        'manifest.js'
    ];
    assets.forEach(asset => {
        t.truthy(clientMFS.readFileSync(join(jsDir, asset), 'utf8'));
    });
});
