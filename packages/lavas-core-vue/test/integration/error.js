/**
 * @file TestCase for errorHandler
 * @author wangyisheng@baidu.com (wangyisheng)
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

test.after('clean', async t => {
    await core.close();
    server && server.close();
});

test.skip('it should show error page correctly', async t => {
// test.serial('it should show error page correctly', async t => {
    await core.init('development', true);

    // switch to SPA mode
    // core.config.build.ssr = false;
    // syncConfig(core, core.config);

    await core.build();

    // set middlewares & start a server
    // app.use(isKoaSupport ? core.koaMiddleware() : core.expressMiddleware());
    app.use(core.expressMiddleware());
    server = app.listen(port);

    // serve main.html
    // let skeletonContent = `<div data-server-rendered=true class=skeleton-wrapper`
    res = await request(app)
        // .get('/index.html');
        .get('/some-page-not-exists');
    t.is(404, res.status);
    // t.is('what?', res.text);
    // include skeleton
    // t.true(res.text.indexOf(skeletonContent) > -1);
});
