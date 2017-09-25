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
    core = new LavasCore(join(__dirname, '../fixtures'));
});

test.afterEach('clean', t => {
    server.close();
});

test.serial('test middleware correctly', async t => {
    await core.init('development', true);
    await core.build();

    let webpackConfig = core.config.webpack;
    let outputPath = webpackConfig.base.output.path;
    let {assetsDir, copyDir} = webpackConfig.shortcuts;

    app.use(core.koaMiddleware());

    let res = await superkoa(app)
        .get('/redirect1');
    console.log(res.text);

    t.is(302, res.status);
});


// test.serial('it should prerender and generate skeleton correctly', async t => {

//     await core.build('production');

//     let webpackConfig = core.config.webpack;
//     let outputPath = webpackConfig.base.output.path;
//     let {assetsDir, copyDir} = webpackConfig.shortcuts;

//     Object.assign(core.config.router, {
//         routes: [
//             {
//                 name: 'detail-id',
//                 prerender: true,
//                 pagename: 'detail',
//                 lazyLoading: true,
//                 chunkname: 'detail-chunk',
//                 path: '/detail/:id',
//                 skeleton: '@/components/detail-id.skeleton.vue',
//                 meta: {
//                     keepAlive: true
//                 }
//             }
//         ]
//     });

//     let ssrContent = '<div id="app" data-server-rendered="true">';
//     let skeletonInlineStyle = '<style>.skeleton-wrapper';
//     let skeletonDomContent = '<div data-server-rendered=true class=skeleton-wrapper';

//     // await core.build('production');
//     await core.runAfterBuild();
//     console.log('koaMiddleware');
//     console.log(core.koaMiddleware());

//     app.use(core.koaMiddleware());

//     // server side render index
//     let res = await superkoa(app)
//         .get('/');
//     t.is(200, res.status);
//     t.true(res.text.indexOf(ssrContent) > -1);

//     // prerender route path: /detail/1
//     res = await superkoa(app)
//         .get('/detail/1');
//     t.is(200, res.status);
//     t.true(res.text.indexOf(ssrContent) === -1);
//     t.true(res.text.indexOf(skeletonInlineStyle) > -1);
//     t.true(res.text.indexOf(skeletonDomContent) > -1);

//     // serve static assets such as manifest.json
//     res = await superkoa(app)
//         .get('/static/manifest.json');
//     t.is(200, res.status);
//     t.is(res.text, await readFile(join(copyDir, 'manifest.json'), 'utf8'));
// });
