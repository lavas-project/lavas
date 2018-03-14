/**
 * @file TestCase for errorHandler
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {join} from 'path';
import test from 'ava';
import {readFile, writeFile, copy, remove} from 'fs-extra';
import LavasCore from '../../core';
import {syncConfig, isKoaSupport, request, createApp, makeTempDir} from '../utils';

test.beforeEach('init lavas-core & server', async t => {
    // copy fixture to temp dir
    let tempDir = await makeTempDir();
    await copy(join(__dirname, '../fixtures/simple'), tempDir);

    t.context.tempDir = tempDir;
    t.context.core = new LavasCore(tempDir);
    t.context.app = createApp();
});

test.afterEach.always('clean', async t => {
    let {core, server, tempDir} = t.context;

    await core.close();
    server && server.close();

    // clean temp dir
    await remove(tempDir);
});

test('it should show 404 page correctly.', async t => {
    let {core, app} = t.context;
    let res;
    await core.init('development', true);
    await core.build();

    // set middlewares & start a server
    app.use(isKoaSupport ? core.koaMiddleware() : core.expressMiddleware());
    t.context.server = app.listen();

    // let default route component (Error.vue) handle 404
    res = await request(app)
        .get('/some-page-not-exists');
    t.is(200, res.status);
    t.true(res.text.indexOf('404 not found') > -1);
});

test('it should redirect to /error when an error throwed in entry-server.js.', async t => {
    let {core, app, tempDir} = t.context;
    let res;
    // modify entry-server.js
    // try to get `window` in Node environment
    let entryServerPath = join(tempDir, 'core/entry-server.js');
    let originalContent = await readFile(entryServerPath, 'utf8');
    await writeFile(entryServerPath, originalContent + 'window;', 'utf8');

    await core.init('development', true);
    await core.build();

    // set middlewares & start a server
    app.use(isKoaSupport ? core.koaMiddleware() : core.expressMiddleware());
    t.context.server = app.listen();

    // redirect to error route
    // https://github.com/visionmedia/supertest/issues/21
    res = await request(app)
        .get('/');
    t.is(302, res.status);
    t.is('/error?error=Internal%20Server%20Error', res.header.location);
});

test('it should redirect to /error when an error throwed in middlewares.', async t => {
    let {core, app, tempDir} = t.context;
    let res;
    // modify middlewares/server-only.js
    // throw an error in a middleware provided by user
    let serverMiddlewarePath = join(tempDir, 'middlewares/server-only.js');
    let originalContent = await readFile(serverMiddlewarePath, 'utf8');
    let newContent = `
    export default function ({route, store, error}) {
        throw new Error('My custom error');
    }`;
    await writeFile(serverMiddlewarePath, newContent, 'utf8');

    await core.init('development', true);

    // don't hide real error message
    // switch to SPA mode
    core.config.errorHandler.showRealErrorMessage = true;
    syncConfig(core, core.config);
    await core.build();

    // set middlewares & start a server
    app.use(isKoaSupport ? core.koaMiddleware() : core.expressMiddleware());
    t.context.server = app.listen();

    // redirect to error route
    // https://github.com/visionmedia/supertest/issues/21
    res = await request(app)
        .get('/');
        console.log(res.status)
    t.is(302, res.status);
    t.is('/error?error=My%20custom%20error', res.header.location);
});
