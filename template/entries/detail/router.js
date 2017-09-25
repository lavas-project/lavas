/**
 * @file router
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

import Vue from 'vue';
import Router from 'vue-router';
import {routes} from '@/.lavas/detail/routes';

Vue.use(Router);

export function createRouter() {
    return new Router({
        mode: 'history',
        base: '/',
        routes
    });
}
