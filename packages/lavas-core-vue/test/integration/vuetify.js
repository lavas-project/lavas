/**
 * @file TestCase for Vuetify
 * @author panyuqi@baidu.com (panyuqi)
 */

import {join} from 'path';
import {readFile} from 'fs-extra';
import test from 'ava';
import LavasCore from '../../dist';

import {syncConfig, isKoaSupport, request, createApp} from '../utils';

let app;
let server;
let port = process.env.PORT || 3000;
let core;
let res;

test.beforeEach('init lavas-core & server', async t => {
    core = new LavasCore(join(__dirname, '../fixtures/vuetify'));
    app = createApp();
});

test.after('clean', async t => {
    await core.close();
    server && server.close();
});

test.serial('it should run in development mode correctly', async t => {
    let distPath = join(__dirname, '../fixtures/vuetify/dist');

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
    server = app.listen(port);

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
