/**
 * @file TestCase for Vuetify
 * @author panyuqi@baidu.com (panyuqi)
 */

import {join} from 'path';
import {readFile, writeFile, copy, remove} from 'fs-extra';
import test from 'ava';
import LavasCore from '../../core';

import {syncConfig, isKoaSupport, request, createApp, makeTempDir} from '../utils';

test.beforeEach('init lavas-core & server', async t => {
    // copy fixture to temp dir
    let tempDir = await makeTempDir();
    await copy(join(__dirname, '../fixtures/vuetify'), tempDir);

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
    let distPath = join(tempDir, 'dist');

    // build in production mode
    await core.init('production', true);

    // remove [hash]
    core.config.build.filenames = {
        entry: 'js/[name].js',
        vendor: 'js/vendor.js',
        vue: 'js/vue.js',
        chunk: 'js/[name].js',
        css: 'css/[name].css',
        img: 'img/[name].[ext]',
        fonts: 'fonts/[name].[ext]'
    };
    syncConfig(core, core.config);

    // build
    await core.build();

    // start server in production mode
    core = new LavasCore(distPath);
    await core.init('production');
    await core.runAfterBuild();

    // set middlewares & start a server
    app.use(isKoaSupport ? core.koaMiddleware() : core.expressMiddleware());
    t.context.server = app.listen();

    // serve /
    res = await request(app)
        .get('/');
    t.is(200, res.status);

    // vuetify should be bundled in vendor.js instead of vue.js
    let vueContent = await readFile(join(distPath, 'static/js/vue.js'), 'utf8');
    let vendorContent = await readFile(join(distPath, 'static/js/vendor.js'), 'utf8');
    t.true(vueContent.indexOf('vuetify') === -1);
    t.true(vendorContent.indexOf('vuetify') > -1);
});
