/**
 * @file client entry
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import Vue from 'vue';
import {getMiddlewares, execSeries, getClientContext} from '@/core/middleware';
import lavasConfig from '@/.lavas/config';
import {createApp} from './app';
import ProgressBar from '@/components/ProgressBar';

import '@/assets/stylus/main.styl';

let loading = Vue.prototype.$loading = new Vue(ProgressBar).$mount();
let {App, router, store} = createApp();
let {entry: entryConf = [], middleware: middConf = {}} = lavasConfig;
let app;

// Sync with server side state.
if (window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__);
}

// Add loading component.
document.body.appendChild(loading.$el);

Vue.mixin({

    /**
     * Add an in-component guard which gets called
     * when component is reused in the new route.
     * eg. /detail/1 => /detail/2
     *
     * @param {Object} to to route
     * @param {Object} from from route
     * @param {Function} next next function
     */
    async beforeRouteUpdate(to, from, next) {
        let asyncData = this.$options.asyncData;
        if (asyncData) {
            loading.start();
            asyncData.call(this, {
                store: this.$store,
                route: to
            }).then(() => {
                loading.finish();
                next();
            }).catch(next);
        }
        else {
            next();
        }
    }
});

/**
 * Add your custom router global guards here.
 * These guards must be added before new App().
 */

handleMiddlewares();

// find correct entry current entry-client.js belongs to
let context = require.context('../', true, /^.*\/entry-client\.js$/);
let entryName = context.keys()[0].match(/^\.\/(.*)\/entry-client\.js$/)[1];
/**
 * When service-worker handles all navigation requests,
 * the same appshell is always served in which condition data should be fetched in client side.
 * When `empty-appshell` attribute detected on body, we know current html is appshell.
 */
let usingAppshell = document.body.hasAttribute('empty-appshell');
if (!usingAppshell && entryConf.find(e => e.name = entryName).ssr) {
    app = new App();
    // In SSR client, fetching & mounting should be put in onReady callback.
    router.onReady(() => {
        /**
         * Add after router is ready because we should
         * avoid double-fetch the data already fetched in entry-server.
         */
        handleAsyncData();
        app.$mount('#app');
    });
}
else {
    // Fetch data in client side.
    handleAsyncData();
    app = new App().$mount('#app');
}

function handleMiddlewares() {
    router.beforeEach(async (to, from, next) => {
        // Avoid loop redirect with next(path)
        const fromPath = from.fullPath.split('#')[0];
        const toPath = to.fullPath.split('#')[0];
        if (fromPath === toPath) {
            return next();
        }

        let matchedComponents = await router.getMatchedComponents(to);

        if (!matchedComponents.length) {
            // can't find matched component, use href jump
            window.location.href = toPath;
            return next();
        }

        // all + client + components middlewares
        let middlewareNames = [
            ...(middConf.all || []),
            ...(middConf.client || []),
            ...matchedComponents
                .filter(({middleware}) => !!middleware)
                .reduce((arr, {middleware}) => arr.concat(middleware), [])
        ];

        // get all the middlewares defined by user
        const middlewares = await getMiddlewares(middlewareNames);

        let unknowMiddleware = middlewareNames.find(name => typeof middlewares[name] !== 'function');
        if (unknowMiddleware) {
            throw new Error(`Unknown middleware ${unknowMiddleware}`);
        }

        let nextCalled = false;
        // nextCalled is true when redirected
        const nextRedirect = path => {
            if (loading.finish) {
                loading.finish();
            }
            if (nextCalled) {
                return;
            }
            nextCalled = true;
            next(path);
        };

        // create a new context for middleware, contains store, route etc.
        let contextInMiddleware = getClientContext({
            to,
            from,
            store,
            next: nextRedirect
        }, app);

        let matchedMiddlewares = middlewareNames.map(name => middlewares[name]);
        await execSeries(matchedMiddlewares, contextInMiddleware);

        if (!nextCalled) {
            next();
        }
    });
}

function handleAsyncData() {
    router.beforeResolve((to, from, next) => {
        let matched = router.getMatchedComponents(to);
        let prevMatched = router.getMatchedComponents(from);

        // [a, b]
        // [a, b, c, d]
        // => [c, d]
        let diffed = false;
        let activated = matched.filter((c, i) => diffed || (diffed = (prevMatched[i] !== c)));

        if (!activated.length) {
            return next();
        }

        loading.start();

        Promise.all(
            activated
             /**
              * asyncData gets called in two conditions:
              * 1. non keep-alive component everytime
              * 2. keep-alive component only at first time(detected by asyncDataFetched flag)
              */
            .filter(c => c.asyncData && (!c.asyncDataFetched || !to.meta.keepAlive))
            .map(async c => {
                await c.asyncData({store, route: to});
                c.asyncDataFetched = true;
            })
        )
        .then(() => {
            loading.finish();
            next();
        })
        .catch(next);
    });
}
