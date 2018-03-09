/**
 * @file Test case for `express/koaMiddleware()` and `render()` functions.
 * @author panyuqi@baidu.com (panyuqi)
 */

import {join} from 'path';
import test from 'ava';
import {copy, remove} from 'fs-extra';
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

async function runCommonTestCases(t) {
    let {core, app} = t.context;

    // only use static middleware
    let selectedInternalMidds = ['static', 'favicon'];
    let addtionalContent = '<div>addtional content</div>';

    // set middlewares & start a server
    if (isKoaSupport) {
        app.use(core.koaMiddleware(selectedInternalMidds));

        // use custom SSR middleware
        app.use(async (ctx, next) => {
            let {err, html} = await core.render({
                url: ctx.path
            });
            ctx.body = html.replace('</html>', `${addtionalContent}</html>`);
        });
    }
    else {
        app.use(core.expressMiddleware(selectedInternalMidds));

        // use custom SSR middleware
        app.use((req, res, next) => {
            core.render({
                url: req.url
            }).then(result => {
                if (result.err) {
                    return next(result.err);
                }
                res.end(result.html.replace('</html>', `${addtionalContent}</html>`));
            });
        });
    }

    t.context.server = app.listen();

    // server side render index
    let ssrContent = '<div id="app" data-server-rendered="true">';
    let res = await request(app)
        .get('/');
    t.is(200, res.status);
    t.true(res.text.indexOf(ssrContent) > -1);
    t.true(res.text.indexOf(addtionalContent) > -1);
}

test('it should run in development mode correctly', async t => {
    let core = t.context.core;
    // init, build and start a dev server
    await core.init('development', true);
    await core.build();

    await runCommonTestCases(t);
});

test('it should run in production mode correctly', async t => {
    let {core, tempDir} = t.context;
    // build in production mode
    await core.init('production', true);

    // disable stats
    core.config.build.stats = false;
    syncConfig(core, core.config);

    await core.build();

    // start server in production mode
    core = new LavasCore(join(tempDir, 'dist'));
    await core.init('production');
    await core.runAfterBuild();

    // update new core in context
    t.context.core = core;

    await runCommonTestCases(t);
});
