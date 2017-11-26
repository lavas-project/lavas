import Vue from 'vue';
import Router from 'vue-router';
<% router.routes.forEach(function(route) { %>
    <% if (route.lazyLoading) { %>
let _<%- route.hash %> = () => import(<% if (route.chunkname) { %>/* webpackChunkName: "<%- route.chunkname %>" */<% } %>'@/<%- route.component %>');
    <% } else { %>
import _<%- route.hash %> from '@/<%- route.component %>';
    <% } %>
<% }); %>

let routes = [
    <%= routesContent %>
];

Vue.use(Router);

<% if (router.pageTransition.enable && router.pageTransition.type === 'slide') { %>
/**
 * to 如果在这个列表中，始终采用从左到右的滑动效果，首页比较适合用这种方式
 *
 * @type {Array.<string>}
 * @const
 */
const ALWAYS_BACK_PAGE = <%= JSON.stringify(router.pageTransition.alwaysBackPages) %>;

/**
 * to 如果在这个列表中，始终采用从右到左的滑动效果
 *
 * @type {Array.<string>}
 * @const
 */
const ALWAYS_FORWARD_PAGE = <%= JSON.stringify(router.pageTransition.alwaysForwardPages) %>;

/**
 * 历史记录，记录访问过的页面的 fullPath
 *
 * @type {Array.<string>}
 * @const
 */
const HISTORY_STACK = [];

/**
 * 判断当前是否是前进，true 表示是前进，否则是回退
 *
 * @param {Object} to 目标 route
 * @param {Object} from 源 route
 * @return {boolean} 是否表示返回
 */
function isForward(to, from) {
    let res = true;

    // to 如果在这个列表中，始终认为是后退
    if (to.name && ALWAYS_BACK_PAGE.indexOf(to.name) !== -1) {

        // 清空历史
        HISTORY_STACK.length = 0;
        res = false;
    }
    else if (from.name && ALWAYS_BACK_PAGE.indexOf(from.name) !== -1) {

        // 如果是从 ALWAYS_BACK_PAGE 过来的，那么永远都是前进
        HISTORY_STACK.push(to.fullPath);
    }
    else if (to.name && ALWAYS_FORWARD_PAGE.indexOf(to.name) !== -1) {

        // to 如果在这个列表中，始终认为是前进
        HISTORY_STACK.push(to.fullPath);
    }
    else {

        // 根据 fullPath 判断当前页面是否访问过，如果访问过，则属于返回
        let index = HISTORY_STACK.indexOf(to.fullPath);
        if (index !== -1) {
            HISTORY_STACK.length = index + 1;
            res = false;
        }
        else {

            // 将 to.fullPath 加到栈顶
            HISTORY_STACK.push(to.fullPath);
        }
    }

    return res;
}
<% } %>

<% if (router.scrollBehavior) { %>
const scrollBehavior = <%= router.scrollBehavior %>;
<% } else { %>
const scrollBehavior = (to, from, savedPosition) => {
    if (savedPosition) {
        return savedPosition;
    } else {
        const position = {};
        // scroll to anchor by returning the selector
        if (to.hash) {
            position.selector = to.hash;
        }
        // check if any matched route config has meta that requires scrolling to top
        if (to.matched.some(m => m.meta.scrollToTop)) {
            // cords will be used if no selector is provided,
            // or if the selector didn't match any element.
            position.x = 0
            position.y = 0
        }
        // if the returned position is falsy or an empty object,
        // will retain current scroll position.
        return position;
    }
};
<% } %>

export function createRouter() {
    let router = new Router({
        mode: '<%- router.mode %>',
        base: '<%- router.base %>',
        scrollBehavior,
        routes
    });

<% if (router.pageTransition.enable) { %>
    router.beforeEach((to, from, next) => {
        if (router.app.$store) {
            if (router.app.$store.state.pageTransition.enable) {
                <% if (router.pageTransition.type === 'slide') { %>
                let effect = isForward(to, from) ? '<%- router.pageTransition.slideLeftClass %>'
                    : '<%- router.pageTransition.slideRightClass %>';
                <% } else { %>
                let effect = '<%- router.pageTransition.transitionClass %>';
                <% } %>
                router.app.$store.commit('pageTransition/setType', '<%- router.pageTransition.type %>');
                router.app.$store.commit('pageTransition/setEffect', effect);
            }
        }
        next();
    });
<% } %>

    return router;
}
