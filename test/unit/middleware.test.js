/**
 * @file test case for koa-middleware
 * @author panyuqi (pyqiverson@gmail.com)
 */

import {join} from 'path';
import glob from 'glob';
import test from 'ava';
import LavasCore from '../../lib';
import {readFile, existsSync} from 'fs-extra';
import Koa from 'koa';
import superkoa from 'superkoa';

let app;
let server;
let port = process.env.PORT || 3000;
let core;

test.beforeEach('init in production mode', async t => {
    app = new Koa();
    server = app.listen(port, () => {
        console.log('server started at localhost:' + port);
    });
    core = new LavasCore(join(__dirname, '../fixtures'), app);
});

test.afterEach('clean', t => {
    server.close();
});

// test.serial('it should run in development mode correctly', async t => {
//
//     await core.init('development');
//
//     let webpackConfig = core.config.webpack;
//     let outputPath = webpackConfig.base.output.path;
//     let {assetsDir, copyDir} = webpackConfig.shortcuts;
//
//     let ssrContent = '<div id="app" data-server-rendered="true">';
//
//     // title injected by vue-meta
//     let homeTitle = '<title data-vue-meta="true">Home - Lavas</title>';
//     let detailTitle = '<title data-vue-meta="true">Detail 1 - Lavas</title>';
//
//     await core.build();
//     await core.run();
//
//     app.use(core.koaMiddleware.bind(core));
//
//     // server side render index
//     let res = await superkoa(app)
//         .get('/');
//     t.is(200, res.status);
//     t.true(res.text.indexOf(ssrContent) > -1);
//     t.true(res.text.indexOf(homeTitle) > -1);
//
//     // server side render /detail/:id
//     res = await superkoa(app)
//         .get('/detail/1');
//     t.is(200, res.status);
//     t.true(res.text.indexOf(ssrContent) > -1);
//     t.true(res.text.indexOf(detailTitle) > -1);
//
//     // serve static assets such as manifest.json
//     res = await superkoa(app)
//         .get('/dist/static/manifest.json');
//     t.is(200, res.status);
//     t.is(res.text, await readFile(join(copyDir, 'manifest.json'), 'utf8'));
//
//     // 404
//     // res = await superkoa(app)
//     //     .get('/xxx/xxxx');
//     // t.is(404, res.status);
// });

// test.serial('it should use koa middleware in production mode correctly', async t => {
//
//     await core.init('production');
//
//     let webpackConfig = core.config.webpack;
//     let outputPath = webpackConfig.base.output.path;
//     let {assetsDir, copyDir} = webpackConfig.shortcuts;
//
//     let ssrContent = '<div id="app" data-server-rendered="true">';
//
//     await core.build();
//     await core.run();
//
//     // use middleware
//     app.use(core.koaMiddleware.bind(core));
//
//     // index
//     let res = await superkoa(app)
//         .get('/');
//     t.is(200, res.status);
//     t.true(res.text.indexOf(ssrContent) > -1);
//
//     // server side render route /detail/1
//     res = await superkoa(app)
//         .get('/detail/1');
//     t.is(200, res.status);
//     t.true(res.text.indexOf(ssrContent) > -1);
//
//     // serve static assets such as manifest.json
//     res = await superkoa(app)
//         .get('/static/manifest.json');
//     t.is(200, res.status);
//     t.is(res.text, await readFile(join(copyDir, 'manifest.json'), 'utf8'));
//
//     res = await superkoa(app)
//         .get('/404');
//     t.is(200, res.status);
//
//     // return 404 when try to get routes.json|vue-ssr-client-manifest.json
//     res = await superkoa(app)
//         .get('/404xxxx');
//     t.is(404, res.status);
//
//     console.log(res)
//
//     // res = await superkoa(app)
//     //     .get('/500');
//     // t.is(500, res.status);
// });

test.serial('it should prerender and generate skeleton correctly', async t => {

    await core.init('production');

    let webpackConfig = core.config.webpack;
    let outputPath = webpackConfig.base.output.path;
    let {assetsDir, copyDir} = webpackConfig.shortcuts;

    Object.assign(core.config.router, {
        routes: [
            {
                name: 'detail-id',
                prerender: true,
                pagename: 'detail',
                lazyLoading: true,
                chunkname: 'detail-chunk',
                path: '/detail/:id',
                skeleton: '@/components/detail-id.skeleton.vue',
                meta: {
                    keepAlive: true
                }
            }
        ]
    });

    let ssrContent = '<div id="app" data-server-rendered="true">';
    let skeletonInlineStyle = '<style>.skeleton-wrapper';
    let skeletonDomContent = '<div data-server-rendered=true class=skeleton-wrapper';

    await core.build();
    await core.run();

    app.use(core.koaMiddleware.bind(core));

    // server side render index
    let res = await superkoa(app)
        .get('/');
    t.is(200, res.status);
    t.true(res.text.indexOf(ssrContent) > -1);

    // prerender route path: /detail/1
    res = await superkoa(app)
        .get('/detail/1');
    t.is(200, res.status);
    t.true(res.text.indexOf(ssrContent) === -1);
    t.true(res.text.indexOf(skeletonInlineStyle) > -1);
    t.true(res.text.indexOf(skeletonDomContent) > -1);

    // serve static assets such as manifest.json
    res = await superkoa(app)
        .get('/static/manifest.json');
    t.is(200, res.status);
    t.is(res.text, await readFile(join(copyDir, 'manifest.json'), 'utf8'));
});
