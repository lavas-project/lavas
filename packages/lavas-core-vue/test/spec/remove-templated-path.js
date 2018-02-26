/**
 * @file TestCase for #43
 * @author panyuqi@baidu.com (panyuqi)
 */

import {join} from 'path';
import test from 'ava';
import LavasCore from '../../dist';

import {syncConfig, isKoaSupport, request, createApp} from '../utils';

let app;
let server;
let port = process.env.PORT || 3000;
let core;
let res;

test.beforeEach('init lavas-core & server', async t => {
    core = new LavasCore(join(__dirname, '../fixtures/simple'));
    app = createApp();
});

test.after('clean', async t => {
    await core.close();
    server && server.close();
});

test.serial('it should run in development mode correctly', async t => {
    await core.init('development', true);

    // switch to SPA mode
    core.config.build.ssr = false;
    syncConfig(core, core.config);

    await core.build();

    // set middlewares & start a server
    app.use(isKoaSupport ? core.koaMiddleware() : core.expressMiddleware());
    server = app.listen(port);

    // serve index.html
    res = await request(app)
        .get('/index.html');
    t.is(200, res.status);

    // generate filenames without [hash]
    let clientMFS = core.builder.devMiddleware.fileSystem;
    let jsDir = join(__dirname, '../fixtures/simple/dist/static/js');
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
