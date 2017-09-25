/**
 * @file client server
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import {createApp} from './app';
import middleware from './middleware';
import middConf from '@/config/middleware';
import {stringify} from 'querystring';
import {middlewareSeries, urlJoin} from './utils';
import {getServerContext} from './context-server';

const isDev = process.env.NODE_ENV !== 'production';

// This exported function will be called by `bundleRenderer`.
// This is where we perform data-prefetching to determine the
// state of our application before actually rendering it.
// Since data fetching is async, this function is expected to
// return a Promise that resolves to the app instance.
export default function (context) {
    return new Promise((resolve, reject) => {
        let {app, router, store} = createApp();

        let url = context.url;
        let fullPath = router.resolve(url).route.fullPath;

        if (fullPath !== url) {
            return reject({url: fullPath});
        }

        context.store = store;
        context.route = router.currentRoute;
        context.meta = app.$meta();

        // set router's location
        router.push(url);

        // wait until router has resolved possible async hooks
        router.onReady(async () => {
            let matchedComponents = router.getMatchedComponents();

            // no matched routes
            if (!matchedComponents.length) {
                let err = new Error('Not Found');
                // simulate nodejs file not found
                err.code = 'ENOENT';
                err.status = 404;
                return reject(err);
            }

            // middleware
            await execMiddlewares.call(this, matchedComponents, context, app);

            // Call fetchData hooks on components matched by the route.
            // A preFetch hook dispatches a store action and returns a Promise,
            // which is resolved when the action is complete and store state has been
            // updated.

            try {
                let s = isDev && Date.now();

                await Promise.all(
                    matchedComponents
                    .filter(({asyncData}) => typeof asyncData === 'function')
                    .map(({asyncData}) => asyncData({
                        store,
                        route: router.currentRoute
                    }))
                );

                isDev && console.log(`data pre-fetch: ${Date.now() - s}ms`);
                // After all preFetch hooks are resolved, our store is now
                // filled with the state needed to render the app.
                // Expose the state on the render context, and let the request handler
                // inline the state in the HTML response. This allows the client-side
                // store to pick-up the server-side state without having to duplicate
                // the initial data fetching on the client.
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

/**
 * execute middlewares
 *
 * @param {Array.<*>} components matched components
 * @param {*} context Vue context
 * @param {*} app Vue app
 */
async function execMiddlewares(components = [], context, app) {
    // server + client + components middlewares
    let middlewareNames = [
        ...(middConf.server || []),
        ...(middConf.client || []),
        ...components
            .filter(({middleware}) => !!middleware)
            .reduce((arr, {middleware}) => arr.concat(middleware), [])
    ];

    let name = middlewareNames.find(name => typeof middleware[name] !== 'function');
    if (name) {
        context.error({
            statusCode: 500,
            message: `Unknown middleware ${name}`
        });
        return;
    }

    let matchedMiddlewares = middlewareNames.map(name => middleware[name]);

    context.next = createNext(context);
    // Update context
    const ctx = getServerContext(context, app);

    await middlewareSeries(matchedMiddlewares, ctx);
}

/**
 * create next
 *
 * @param {*} context context
 * @return {Function}
 */
function createNext(context) {
    return opts => {
        context.redirected = opts;
        if (!context.res) {
            return;
        }

        opts.query = stringify(opts.query);
        opts.path = opts.path + (opts.query ? '?' + opts.query : '');
        if (opts.path.indexOf('http') !== 0
            && opts.path.indexOf('/') !== 0
        ) {
            opts.path = urlJoin('/', opts.path);
        }
        // Avoid loop redirect
        if (opts.path === context.url) {
            context.redirected = false;
            return;
        }
        context.res.writeHead(opts.status, {
            Location: opts.path
        });
        context.res.end();
    };
}
