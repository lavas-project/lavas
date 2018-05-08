/**
 * @file TestCase for MPA
 * @author panyuqi@baidu.com (panyuqi)
 */

import {join} from 'path';
import {readFileSync, writeFile} from 'fs-extra';

import {syncConfig, isKoaSupport, request, createApp, makeTempDir, test} from '../utils';

test('it should run in development mode correctly', async t => {
    let {core, app} = t.context;
    let res;
    await core.init('development', true);

    // switch to SPA mode
    core.config.build.ssr = false;
    syncConfig(core, core.config);

    await core.build();

    // set middlewares & start a server
    // app.use(isKoaSupport ? core.koaMiddleware() : core.expressMiddleware());
    app.use(async (ctx, next) => {
        let url = ctx.request.url;
        ctx.body = '<div data-server-rendered=true></div>';
        ctx.status = 200;
    });
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

    let htmlContent = readFileSync(join(tempDir, 'dist/index.html'), 'utf8');

    // include skeleton
    let skeletonContent = '<div data-server-rendered=true>';
    t.true(htmlContent.indexOf(skeletonContent) > -1);

    // include sw-register
    let swRegisterContent = '/sw-register.js?v=';
    t.true(htmlContent.indexOf(swRegisterContent) > -1);
});
