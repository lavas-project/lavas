/**
 * @file test case for utils/router.js
 * @author panyuqi (pyqiverson@gmail.com)
 */

import {generateRoutes, routes2Reg, matchUrl} from '../../../dist/core/utils/router';
import {join} from 'path';
import test from 'ava';

// generateRoutes()
test('it should generate routes according to the structure of directory', async t => {
    let routes = await generateRoutes(join(__dirname, '../../fixtures/pages'));

    t.true(routes.length === 6);

    // dynamic param :id
    t.deepEqual(routes[0], {
        path: '/detail',
        component: 'pages/Detail.vue',
        name: 'detail',
        children: [
            {
                component: "pages/detail/_id.vue",
                name: "detailId",
                path: ":id",
            }
        ]
    });

    t.deepEqual(routes[1], {
        path: '/error',
        component: 'pages/Error.vue',
        name: 'error'
    });

    t.deepEqual(routes[2], {
        path: '/',
        component: 'pages/Index.vue',
        name: 'index'
    });

    // nested routes
    t.deepEqual(routes[3], {
        path: '/parent',
        component: 'pages/Parent.vue',
        name: 'parent',
        children: [
            {
                component: "pages/parent/Child2.vue",
                name: "parentChild2",
                path: "child2",
            },
            {
                component: "pages/parent/Child1.vue",
                name: "parentChild1",
                path: "child1",
            }
        ]
    });

    t.deepEqual(routes[4], {
        component: "pages/test/Index.vue",
        name: "testIndex",
        path: "/test",
    });

    t.deepEqual(routes[5], {
        component: "pages/test/_id.vue",
        name: "testId",
        path: "/test/:id",
    });
});

// routes2Reg()
test('it should convert routes pattern to regexp', t => {
    let regExp = /^.*/;
    let routes = '/detail/:id';

    // return origin RegExp directly
    t.is(routes2Reg(regExp), regExp);

    // convert path to RegExp
    let reg = routes2Reg(routes);
    t.true(reg.test('/detail/123'));
    t.false(reg.test('/xxxx/xxxx'));
});

// matchUrl()
test('it should check if a url matches a route pattern', t => {
    let url = '/detail/123?param1=1';

    // string case
    let routeInString = '/detail/:id';
    let wrongRouteInString = '/xxx/detail/:id';
    t.true(matchUrl(routeInString, url));
    t.false(matchUrl(wrongRouteInString, url));

    // function case
    let routeObj = {
        test: (url) => url.startsWith('/detail')
    }
    t.true(matchUrl(routeObj, url));

    // combined case, in an array
    t.true(matchUrl([routeInString, wrongRouteInString], url));
    t.true(matchUrl([wrongRouteInString, routeObj], url));
});
