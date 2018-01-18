/**
 * @file middleware
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

'use strict';

import {stringify} from 'querystring';

export async function getMiddlewares(names) {
    let middlewares = {};
    try {
        await Promise.all(names.map(async name => {
            middlewares[name] = (await import(`@/middlewares/${name}.js`)).default;
        }));
        return middlewares;
    }
    catch (e) {
        console.log('[Lavas] fail to import middleware: ', e);
    }
}

export function getClientContext(context, app) {
    let ctx = {
        isClient: true,
        app: app,
        store: context.store,
        route: context.to,
        from: context.from
    };
    const next = context.next;
    ctx.params = ctx.route.params || {};
    ctx.query = ctx.route.query || {};
    ctx.redirect = function ({status = 302, path = '', query = {}, external = false}) {
        ctx._redirected = true; // Used in middleware
        next({
            path,
            query,
            status,
            external
        });
    };

    return ctx;
}

export function getServerContext(context, app) {
    let ctx = {
        isServer: true,
        app: app,
        store: context.store,
        route: context.route
    };
    const next = context.next;
    ctx.params = ctx.route.params || {};
    ctx.query = ctx.route.query || {};
    ctx.redirect = function ({status = 302, path = '', query = {}}) {
        ctx._redirected = true; // Used in middleware
        next({
            path,
            query,
            status
        });
    };
    if (context.req) {
        ctx.req = context.req;
    }
    if (context.res) {
        ctx.res = context.res;
    }

    return ctx;
}

/**
 * create next
 *
 * @param {*} context context
 * @return {Function}
 */
export function createNext(context) {
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

export async function execSeries(promises, context) {
    for (let i = 0; i < promises.length; i++) {
        if (context._redirected) {
            return;
        }
        await promisify(promises[i], context);
    }
}

export function promisify(fn, context) {
    let promise;

    if (fn.length === 2) {
        // fn(context, callback)
        promise = new Promise((resolve, reject) => {
            fn(context, (err, data) => {
                if (err) {
                    // 错误处理
                    context.error(err);
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    else {
        promise = fn(context);
        if (!promise || (!(promise instanceof Promise) && (typeof promise.then !== 'function'))) {
            promise = Promise.resolve(promise);
        }
    }

    return promise;
}

export function urlJoin(...args) {
    return args.join('/').replace(/\/+/g, '/');
}
