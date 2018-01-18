/**
 * @file Test case for `express/koaMiddleware()` and `render()` functions.
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

test.beforeEach('init lavas-core & server', async t => {
    core = new LavasCore(join(__dirname, '../fixtures/simple'));
    app = createApp();
});

test.afterEach('clean', t => {
    server && server.close();
});

async function runCommonTestCases(t) {
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

    server = app.listen(port);

    // server side render index
    let ssrContent = '<div id="app" data-server-rendered="true">';
    let res = await request(app)
        .get('/');
    t.is(200, res.status);
    t.true(res.text.indexOf(ssrContent) > -1);
    t.true(res.text.indexOf(addtionalContent) > -1);
}

test.serial('it should run in development mode correctly', async t => {
    // init, build and start a dev server
    await core.init('development', true);
    await core.build();

    await runCommonTestCases(t);
});

test.serial('it should run in production mode correctly', async t => {
    // build in production mode
    await core.init('production', true);
    await core.build();

    // start server in production mode
    core = new LavasCore(join(__dirname, '../fixtures/simple/dist'));
    await core.init('production');
    await core.runAfterBuild();

    await runCommonTestCases(t);
});
