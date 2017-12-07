/**
 * @file entry
 * @author lavas
 */

import Vue from 'vue';
import Meta from 'vue-meta';

import {createRouter} from '@/.lavas/*__ENTRY_NAME__*/router';
import {createStore} from '@/core/store';
import AppComponent from './App.vue';
import LavasLink from '@/.lavas/LavasLink';

Vue.use(Meta);

Vue.config.productionTip = false;

Vue.component(LavasLink.name, LavasLink);

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
