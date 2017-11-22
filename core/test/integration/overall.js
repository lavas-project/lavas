/**
 * @file 全局集成测试
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {join} from 'path';
import test from 'ava';
import LavasCore from '../../lib';
import Koa from 'koa';
import superkoa from 'superkoa';

let app;
let server;
let port = process.env.PORT || 3000;
let core;

test.beforeEach('init in production mode', async t => {
    core = new LavasCore(join(__dirname, '../fixtures'));

    app = new Koa();
    server = app.listen(port, () => {
        console.log('server started at localhost:' + port);
    });
    // core = new LavasCore(join(__dirname, '../fixtures'), app);
});

test.afterEach('clean', t => {
    server.close();
});

test.serial('it should run in development mode correctly', async t => {

    await core.init('development', true);
    app.use(core.koaMiddleware());

    // let webpackConfig = core.config.webpack;
    // let outputPath = webpackConfig.base.output.path;
    // let {assetsDir, copyDir} = webpackConfig.shortcuts;

    let ssrContent = '<div id="app" data-server-rendered="true">';

    // title injected by vue-meta
    let homeTitle = '<title data-vue-meta="true">Home - Lavas</title>';
    let detailTitle = '<title data-vue-meta="true">Detail 1 - Lavas</title>';

    // await core.build();
    // await core.run();

    // app.use(core.koaMiddleware.bind(core));

    // server side render index
    let res = await superkoa(app)
        .get('/');
    t.is(200, res.status);
    t.is('', res.text);
    // t.true(res.text.indexOf(ssrContent) > -1);
    // t.true(res.text.indexOf(homeTitle) > -1);

    // server side render /detail/:id
    // res = await superkoa(app)
    //     .get('/detail/1');
    // t.is(200, res.status);
    // t.true(res.text.indexOf(ssrContent) > -1);
    // t.true(res.text.indexOf(detailTitle) > -1);

    // // serve static assets such as manifest.json
    // res = await superkoa(app)
    //     .get('/dist/static/manifest.json');
    // t.is(200, res.status);
    // t.is(res.text, await readFile(join(copyDir, 'manifest.json'), 'utf8'));

    // 404
    // res = await superkoa(app)
    //     .get('/xxx/xxxx');
    // t.is(404, res.status);
});
