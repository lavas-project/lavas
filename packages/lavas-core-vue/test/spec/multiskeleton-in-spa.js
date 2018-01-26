/**
 * @file TestCase for #44
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
    core = new LavasCore(join(__dirname, '../fixtures/skeleton'));
    app = createApp();
});

test.afterEach('clean', t => {
    server && server.close();
});

test.serial('it should not generate skeleton when `skeleton.enable` is `false`.', async t => {
    await core.init('development', true);

    // disable skeleton feature
    core.config.skeleton = {
        enable: false
    };
    syncConfig(core, core.config);

    await core.build();

    // set middlewares & start a server
    app.use(isKoaSupport ? core.koaMiddleware() : core.expressMiddleware());
    server = app.listen(port);

    // serve index.html
    let skeletonContent = `<div data-server-rendered=true class=skeleton-wrapper`;
    res = await request(app)
        .get('/index.html');
    t.is(200, res.status);
    // should not include skeleton
    t.true(res.text.indexOf(skeletonContent) === -1);
});

test.serial('it should generate a default skeleton correctly', async t => {
    await core.init('development', true);

    // enable skeleton and generate a default skeleton with `core/Skeleton.vue`
    core.config.skeleton = {
        enable: true
    };
    syncConfig(core, core.config);

    await core.build();

    // set middlewares & start a server
    app.use(isKoaSupport ? core.koaMiddleware() : core.expressMiddleware());
    server = app.listen(port);

    // serve index.html
    let skeletonContent = `<div data-server-rendered=true><div id=skeleton class=skeleton-wrapper`;
    let skeletonScript = `var pathname = window.location.pathname`;
    let skeletonStyle = `<style>.skeleton-wrapper`;
    res = await request(app)
        .get('/index.html');
    t.is(200, res.status);
    // include skeleton DOM
    t.true(res.text.indexOf(skeletonContent) > -1);
    // include skeleton script
    t.true(res.text.indexOf(skeletonScript) > -1);
    // include skeleton style
    t.true(res.text.indexOf(skeletonStyle) > -1);
});

test.serial('it should generate multi skeletons correctly', async t => {
    await core.init('development', true);

    // enable skeleton and generate a default skeleton with `core/Skeleton.vue`
    core.config.skeleton = {
        enable: true,
        routes: [
            {
                path: '/detail/:id',
                componentPath: 'core/DetailSkeleton.vue'
            },
            {
                path: '*',
                componentPath: 'core/Skeleton.vue'
            }
        ]
    };
    syncConfig(core, core.config);

    await core.build();

    // set middlewares & start a server
    app.use(isKoaSupport ? core.koaMiddleware() : core.expressMiddleware());
    server = app.listen(port);

    // serve index.html
    let defaultSkeletonDOM = `<div id=skeleton class=skeleton-wrapper`;
    let detailSkeletonDOM = `<div id=detail-skeleton class=skeleton-wrapper`;
    let skeletonScript = `if (isMatched(/^\\/detail\\/([^\\/]+?)(?:\\/)?$/i, \'history\'))`;
    let skeletonStyle = `<style>.skeleton-wrapper`;
    res = await request(app)
        .get('/index.html');
    t.is(200, res.status);
    // include skeleton DOM
    t.true(res.text.indexOf(defaultSkeletonDOM) > -1);
    t.true(res.text.indexOf(detailSkeletonDOM) > -1);
    // include skeleton script
    t.true(res.text.indexOf(skeletonScript) > -1);
    // include skeleton style
    t.true(res.text.indexOf(skeletonStyle) > -1);
});
