/**
 * @file server entry
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import {getMiddlewares, getServerContext, execSeries, createNext} from './middleware';
import lavasConfig from '@/.lavas/config';
import {stringify} from 'querystring';

const {middleware: middConf = {}} = lavasConfig;

// import app.js from all modules
const apps = getAllApps();

export default function (context) {
    return new Promise((resolve, reject) => {
        let {url, entryName, config} = context;
        // remove base first
        let base = config.entry.find(e => e.name === entryName).base
            .replace(/^\/+/, '').replace(/\/+$/, '');
        url = url.replace(new RegExp(`^/${base}/?`), '/');

        // create app for current entry
        let createApp = apps[entryName].createApp;
        if (!createApp || typeof createApp !== 'function') {
            return reject();
        }
        let {App, router, store} = createApp();
        let app = new App();

        // get current url from router
        let fullPath = router.resolve(url).route.fullPath;
        if (fullPath !== url) {
            return reject({url: fullPath});
        }

        // set router's location
        router.push(url);

        // mount store, route and meta on context
        context.store = store;
        context.route = router.currentRoute;
        context.meta = app.$meta();

        // wait until router has resolved possible async hooks
        router.onReady(async () => {

            // get all the components match current route
            let matchedComponents = router.getMatchedComponents() || [];

            try {
                // collect names of middlewares from lavas.config & matched components
                let middlewareNames = [
                    ...(middConf.all || []),
                    ...(middConf.server || []),
                    ...matchedComponents
                        .filter(({middleware}) => !!middleware)
                        .reduce((arr, {middleware}) => arr.concat(middleware), [])
                ];

                // get all the middlewares defined by user
                const middlewares = await getMiddlewares(middlewareNames);
                let matchedMiddlewares = middlewareNames.map(name => middlewares[name]);

                // if a middleware is undefined, throw an error
                let unknowMiddleware = middlewareNames.find(
                    name => typeof middlewares[name] !== 'function');
                if (unknowMiddleware) {
                    reject({
                        status: 500,
                        message: `Unknown middleware ${unknowMiddleware}`
                    });
                }

                // add next() to context
                context.next = createNext(context);

                // create a new context for middleware, contains store, route etc.
                const contextInMiddleware = getServerContext(context, app);

                // exec middlewares
                await execSeries(matchedMiddlewares, contextInMiddleware);

                // exec asyncData() defined in every matched component
                await Promise.all(
                    matchedComponents
                    .filter(({asyncData}) => typeof asyncData === 'function')
                    .map(({asyncData}) => asyncData({
                        store,
                        route: router.currentRoute
                    }))
                );

                // mount the latest snapshot of store on context
                context.state = store.state;
                context.isProd = process.env.NODE_ENV === 'production';
                resolve(app);
            }
            catch (err) {
                reject(err);
            }
        }, reject);
    });
}

function getAllApps() {
    let apps = {};
    let context = require.context('../entries', true, /^.*\/app\.js$/);

    context.keys().forEach(filename => {
        let match = filename.match(/\/(.+)\/app\.js$/);

        if (match) {
            let entry = match[1];
            apps[entry] = context(filename);
        }
    });

    return apps;
}
