/**
 * @file server entry
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import createApp from './createApp';

export default function (context) {
    // return new Promise((resolve, reject) => {
        // let {url, config} = context;

        // create app
        // let {App, store, actions, routes} = createApp();

        // mount store, route and meta on context
        // context.store = store;
        // context.routes = routes;
        // context.meta = app.$meta();

        // resolve();
    // });
    return createApp();
}