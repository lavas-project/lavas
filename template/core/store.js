/**
 * @file store
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

// borrow from nuxt.js
// https://github.com/nuxt/nuxt.js/blob/dev/lib/app/store.js

'use strict';

import Vue from 'vue';
import Vuex from 'vuex';
import Meta from 'vue-meta';

Vue.use(Vuex);
// TODO:meta相关从app.js先搬来这里，之后再决定放哪里
Vue.use(Meta, {
    keyName: 'head', // vue-meta 的参数名称
    attribute: 'data-vue-meta', // 由 vue-meta 渲染的元素会添加一个属性 <title data-vue-meta=""></title>
    ssrAttribute: 'data-vue-meta-server-rendered', // 由服务器端渲染的 vue-meta 元素的自定义属性名称
    tagIDKeyName: 'vmid' // vue-meta 用于确定是否覆盖或附加标签的属性名称
});
Vue.config.productionTip = false;

// find all files in {srcDir}/store
const files = require.context('@/store', true, /^\.\/.*\.js$/);
const filenames = files.keys();

/**
 * store data
 *
 * @type {Object}
 */
let storeData = {};

// find index file
for (let filename of filenames) {
    if (filename === './index.js') {
        // get index file
        storeData = getModule(filename);
        break;
    }
}

// if storeData is not a function, then require all other files, and add then to storeData
if (typeof storeData !== 'function') {
    storeData.modules = storeData.modules || {};

    for (let filename of filenames) {
        if (filename === './index.js') {
            continue;
        }

        let name = filename.replace(/^\.\//, '').replace(/\.js$/, '');
        let paths = name.split('/');
        let module = getModuleNamespace(storeData, paths);

        name = paths.pop();
        module[name] = getModule(filename);
        // console.log(module[name]);
        module[name].namespaced = true;
    }
}

// export createStore
export const createStore = storeData instanceof Function
    ? storeData
    : () => new Vuex.Store(Object.assign({}, storeData, {
        state: storeData.state instanceof Function ? storeData.state() : {}
    }));

/**
 * get module by file name
 * this module or state must be a function which returns a Vuex instance of fresh state instance
 *
 * @param {string} filename filename
 * @return {*}
 */
function getModule(filename) {
    const file = files(filename);
    const module = file.default || file;

    if (module.commit) {
        throw new Error(
            '[lavas] store/' + filename.replace('./', '') + ' should export a method which returns a Vuex instance.'
        );
    }

    if (module.state && typeof module.state !== 'function') {
        throw new Error(
            '[lavas] state should be a function in store/' + filename.replace('./', '')
        );
    }

    return module;
}

/**
 * get module namespace
 *
 * @param {Object} storeData store
 * @param {Array.<string>} paths path
 * @return {Object}
 */
function getModuleNamespace(storeData, paths) {
    if (paths.length === 1) {
        return storeData.modules;
    }

    let namespace = paths.shift();

    let nsModule = storeData.modules[namespace] = storeData.modules[namespace] || {};
    nsModule.namespaced = true;
    nsModule.modules = nsModule.modules || {};

    return getModuleNamespace(nsModule, paths);
}
