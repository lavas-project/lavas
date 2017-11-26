/**
 * @file test case for RouteManager.js
 * @author panyuqi (pyqiverson@gmail.com)
 */

/* eslint-disable fecs-use-standard-promise */

import {join} from 'path';
import test from 'ava';
import LavasCore from '../../lib';
import {readFile} from 'fs-extra';

let core;

test.beforeEach('init', async t => {
    core = new LavasCore(join(__dirname, '../fixtures'));
    await core.init('production');
});

/**
 * run the tests serially because they both modify .lavas/routes.js
 *
 */
test.serial('it should generate routes.js in .lavas directory', async t => {
    await core.routeManager.buildRoutes();

    let content = await readFile(join(__dirname, '../fixtures/.lavas/routes.js'), 'utf8');

    t.true(content.indexOf('path: \'/detail/:id\'') > -1
        && content.indexOf('name: \'detailId\'') > -1
        && content.indexOf('path: \'/\'') > -1
        && content.indexOf('name: \'index\'') > -1);
});

test.serial('it should modify route objects based on router config', async t => {

    Object.assign(core.config.router, {
        routes: [
            {
                pattern: /\/detail/,
                lazyLoading: true,
                chunkname: 'my-chunk',
                path: '/detail/rewrite/:id',
                meta: {
                    keepAlive: true
                }
            }
        ]
    });

    await core.routeManager.buildRoutes();

    let content = await readFile(join(__dirname, '../fixtures/.lavas/routes.js'), 'utf8');

    // Webpack code-splitting
    t.true(content.indexOf('() => import(/* webpackChunkName: \"my-chunk\" */ \'@/pages/detail/_id.vue\');') > -1);

    // rewrite route path
    t.true(content.indexOf('path: \'/detail/rewrite/:id\'') > -1);

    // support route meta
    t.true(content.indexOf('meta: {"keepAlive":true}') > -1);
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
//     await core.routeManager.buildRoutes();

//     let routes = core.routeManager.routes;

//     // regexp can't be serialized
//     emptyRegExp(routes);

//     let savedRoutes = JSON.parse(await readFile(join(__dirname, '../fixtures/dist/routes.json'), 'utf8'));

//     t.deepEqual(routes, savedRoutes)
// });
