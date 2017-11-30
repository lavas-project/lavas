/**
 * @file entry
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import Vue from 'vue';
import Meta from 'vue-meta';
import {createRouter} from '@/.lavas/main/router';
import {createStore} from '@/core/store';
import AppComponent from './App.vue';
import LavasLink from '@/.lavas/LavasLink';

Vue.use(Meta);

Vue.config.productionTip = false;

Vue.component(LavasLink.name, LavasLink);

/* eslint-disable no-new */
export function createApp() {
    let router = createRouter();
    let store = createStore();
    let App = Vue.extend({
        router,
        store,
        ...AppComponent
    });
    return {App, router, store};
}

if (module.hot) {
    module.hot.accept();
}
