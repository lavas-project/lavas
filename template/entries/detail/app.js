/**
 * @file entry
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import Vue from 'vue';
import {createRouter} from './router';
import {createStore} from '@/core/store';
import App from './App.vue';

/* eslint-disable no-new */
export function createApp() {
    let router = createRouter();
    let store = createStore();
    let app = new Vue({
        router,
        store,
        ...App
    });
    return {app, router, store};
}
