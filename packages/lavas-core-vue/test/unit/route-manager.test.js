/**
 * @file test case for RouteManager.js
 * @author panyuqi (pyqiverson@gmail.com)
 */

/* eslint-disable fecs-use-standard-promise */

import {join} from 'path';
import test from 'ava';
import LavasCore from '../../core';
import {readFile, copy, remove} from 'fs-extra';

import {syncConfig, makeTempDir} from '../utils';

test.beforeEach('init lavas-core & server', async t => {
    // copy fixture to temp dir
    let tempDir = await makeTempDir();
    await copy(join(__dirname, '../fixtures/simple'), tempDir);

    t.context.tempDir = tempDir;
    t.context.core = new LavasCore(tempDir);
});

test.afterEach.always('clean', async t => {
    let {core, tempDir} = t.context;
    // clean temp dir
    await remove(tempDir);

    await core.close();
});

/**
 * generate .lavas/main/router.js
 *
 */
test('it should generate router.js in .lavas directory', async t => {
    let {core, tempDir} = t.context;
    await core.init('development', true);
    await core.builder.routeManager.buildRoutes();

    let content = await readFile(join(tempDir, '.lavas/router.js'), 'utf8');

    t.true(content.indexOf('"path": ":id"') > -1
        && content.indexOf('"name": "detailId"') > -1
        && content.indexOf('"path": "/"') > -1
        && content.indexOf('"name": "index"') > -1);
});

/**
 * Use lavas.config.router to override some rules
 * NOTE: routes.pattern apply to route.fullPath
 *       rewrite.from apply to route.path
 */
test('it should modify route objects based on router config', async t => {
    let {core, tempDir} = t.context;
    await core.init('development', true);
    Object.assign(core.builder.routeManager.config, {
        router: {
            rewrite: [
                {
                    from: '/detail',
                    to: '/rewrite/detail'
                }
            ],
            routes: [
                {
                    pattern: /\/detail/,
                    lazyLoading: true,
                    chunkname: 'my-chunk',
                    meta: {
                        keepAlive: true
                    }
                }
            ]
        }
    });

    await core.builder.routeManager.buildRoutes();

    let content = await readFile(join(tempDir, '.lavas/router.js'), 'utf8');

    // Webpack code-splitting, merge Detail.vue & _id.vue into my-chunk
    t.true(content.indexOf('() => import(/* webpackChunkName: \"my-chunk\" */\'@/pages/Detail.vue\');') > -1);
    t.true(content.indexOf('() => import(/* webpackChunkName: \"my-chunk\" */\'@/pages/detail/_id.vue\');') > -1);

    // rewrite route path
    t.true(content.indexOf('"path": "/rewrite/detail"') > -1);

    // support route meta
    t.true(content.indexOf(
        `"meta": {
            "keepAlive": true
        }`
    ) > -1);
});

// function emptyRegExp(routes) {
//     routes.forEach(route => {
//         route.pathRegExp = {};
//         if (route.children && route.children.length) {
//             emptyRegExp(route.children);
//         }
//     });
// }

// test.serial('it should generate routes.json in dist directory in prod mode', async t => {
//     let routeManager = core.builder.routeManager;
//     await routeManager.buildRoutes();
//
//     let routes = routeManager.routes;
//
//     // regexp can't be serialized
//     emptyRegExp(routes);
//
//     let savedRoutes = JSON.parse(await readFile(join(__dirname, '../fixtures/simple/dist/routes.json'), 'utf8'));
//
//     t.deepEqual(routes, savedRoutes);
// });
