/**
 * @file server entry
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import Vue from 'vue';
import FastClick from 'fastclick';
import middleware from '@/core/middleware';
import middConf from '@/config/middleware';
import {createApp} from './app';
import ProgressBar from '@/core/components/ProgressBar.vue';
import {middlewareSeries} from '@/core/utils';
import {getClientContext} from '@/core/context-client';

// 全局的进度条，在组件中可通过 $loading 访问
let loading = Vue.prototype.$loading = new Vue(ProgressBar).$mount();
let {app, router, store} = createApp();
let me = this;

if (window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__);
}

document.body.appendChild(loading.$el);
FastClick.attach(document.body);

Vue.mixin({

    // 当复用的路由组件参数发生变化时，例如/detail/1 => /detail/2
    async beforeRouteUpdate(to, from, next) {

        // asyncData方法中包含异步数据请求
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

    // beforeRouteEnter(to, from, next) {
    //     next(vm => {});
    // },
    // beforeRouteLeave(to, from, next) {
    //     next();
    // }
});

router.beforeEach(async (to, from, next) => {
    // Avoid loop redirect with next(path)
    const fromPath = from.fullPath.split('#')[0];
    const toPath = to.fullPath.split('#')[0];
    if (fromPath === toPath) {
        return;
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

    // Update context
    const ctx = getClientContext({
        to,
        from,
        store,
        next: nextRedirect.bind(me)
    }, app);

    let matched = await router.getMatchedComponents(to);

    if (!matched.length) {
        // can't find matched component, use href jump
        window.location.href = toPath;
        return next();
    }

    await execMiddlewares.call(this, matched, ctx);

    if (!nextCalled) {
        next();
    }
});

// 此时异步组件已经加载完成
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

         // 两种情况下执行asyncData:
         // 1. 非keep-alive组件每次都需要执行
         // 2. keep-alive组件首次执行，执行后添加标志

        .filter(c => c.asyncData && (!c.asyncDataFetched || to.meta.notKeepAlive))
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

router.onReady(() => app.$mount('#app'));


/**
 * execute middlewares
 *
 * @param {Array.<*>} components matched components
 * @param {*} context Vue context
 */
async function execMiddlewares(components = [], context) {
    // all + client + components middlewares
    let middlewareNames = [
        ...(middConf.all || []),
        ...(middConf.client || []),
        ...components
            .filter(({middleware}) => !!middleware)
            .reduce((arr, {middleware}) => arr.concat(middleware), [])
    ];

    let name = middlewareNames.find(name => typeof middleware[name] !== 'function');
    if (name) {
        // 用户自行处理错误
        throw new Error(`Unknown middleware ${name}`);
    }

    await middlewareSeries(middlewareNames.map(name => middleware[name]), context);
}
