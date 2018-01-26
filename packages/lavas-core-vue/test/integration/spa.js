/**
 * @file TestCase for MPA
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

test.before('init lavas-core & server', async t => {
    core = new LavasCore(join(__dirname, '../fixtures/simple'));
    app = createApp();
});

test.after('clean', t => {
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

    // serve main.html
    let skeletonContent = '<div data-server-rendered=true>';
    res = await request(app)
        .get('/index.html');
    t.is(200, res.status);
    // include skeleton
    t.true(res.text.indexOf(skeletonContent) > -1);
});
