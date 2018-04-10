/**
 * @file MiddlewareComposer.js
 * @author lavas
 */

import {join, posix, basename} from 'path';
import {existsSync} from 'fs-extra';
import {parse} from 'url';
import {isFromCDN, removeTrailingSlash} from './utils/path';

import {ASSETS_DIRNAME_IN_DIST} from './constants';

import {compose} from 'compose-middleware';
import {Router} from 'express';
import serveStatic from 'serve-static';
import favicon from 'serve-favicon';
import compression from 'compression';

import ssrFactory from './middlewares/ssr';
import koaErrorFactory from './middlewares/koa-error';
import expressErrorFactory from './middlewares/express-error';
import staticFactory from './middlewares/static';

// enum of internal middlewares
const INTERNAL_MIDDLEWARE = {
    TRAILING_SLASH: 'trailing-slash',
    STATIC: 'static',
    SERVICE_WORKER: 'service-worker',
    FAVICON: 'favicon',
    COMPRESSION: 'compression',
    SSR: 'ssr',
    ERROR: 'error'
};

const ALL_MIDDLEWARES = Object.keys(INTERNAL_MIDDLEWARE).map(key => INTERNAL_MIDDLEWARE[key]);

export default class MiddlewareComposer {
    constructor(core) {
        this.core = core;
        this.cwd = core.cwd;
        this.config = core.config;
        this.isProd = core.isProd;
        this.internalMiddlewares = [];
    }

    add(middleware, head = false) {
        if (typeof middleware !== 'function') {
            throw new Error('Middleware must be a function.');
        }
        if (head) {
            this.internalMiddlewares.unshift(middleware);
        }
        else {
            this.internalMiddlewares.push(middleware);
        }
    }

    reset(config) {
        this.config = config;
        this.internalMiddlewares = [];
    }

    /**
     * setup some internal middlewares
     *
     */
    setup() {
        if (this.config.build
            && this.config.build.compress) {
            // gzip compression
            this.add(compression());
        }
        // serve favicon
        let faviconPath = posix.join(this.cwd, ASSETS_DIRNAME_IN_DIST, 'img/icons/favicon.ico');
        this.add(favicon(faviconPath));
    }

    /**
     * compose middlewares into a chain.
     * NOTE: MUST be called in Node >= 7.6.0 because of "async" syntax.
     *
     * @return {Function} koaMiddleware
     */
    koa(selectedMiddlewares = ALL_MIDDLEWARES) {
        if (!Array.isArray(selectedMiddlewares)) {
            selectedMiddlewares = [selectedMiddlewares];
        }

        const composeKoa = require('koa-compose');
        const c2k = require('koa-connect');
        const mount = require('koa-mount');
        const koaStatic = require('koa-static');
        const send = require('koa-send');

        let {router: {base}, build: {ssr, publicPath}, serviceWorker, errorHandler} = this.config;
        base = removeTrailingSlash(base || '/');

        if (selectedMiddlewares.includes(INTERNAL_MIDDLEWARE.COMPRESSION)) {
            // gzip compression
            this.add(compression());
        }

        if (selectedMiddlewares.includes(INTERNAL_MIDDLEWARE.FAVICON)) {
            // serve favicon
            let faviconPath = posix.join(this.cwd, ASSETS_DIRNAME_IN_DIST, 'img/icons/favicon.ico');
            if (existsSync(faviconPath)) {
                this.add(favicon(faviconPath));
            }
        }

        // transform express/connect style middleware to koa style
        this.internalMiddlewares = this.internalMiddlewares.map(c2k);

        // koa defaults to 404 when it sees that status is unset
        this.add(async (ctx, next) => {
            ctx.status = 200;
            await next();
        }, true);

        // handle errors
        if (selectedMiddlewares.includes(INTERNAL_MIDDLEWARE.ERROR)) {
            this.add(koaErrorFactory(errorHandler), true);
        }

        // Redirect without trailing slash.
        if (selectedMiddlewares.includes(INTERNAL_MIDDLEWARE.TRAILING_SLASH)) {
            this.add(async (ctx, next) => {
                if (base === ctx.path) {
                    ctx.redirect(`${ctx.path}/${ctx.search}`);
                }
                else {
                    await next();
                }
            });
        }

        if (ssr) {
            /**
             * Add static files middleware only in prod mode,
             * because we already have webpack-dev-middleware in dev mode.
             * Don't need this middleware when CDN being used to serve static files.
             */
            if (this.isProd && !isFromCDN(publicPath)) {

                if (selectedMiddlewares.includes(INTERNAL_MIDDLEWARE.STATIC)) {
                    // serve /static
                    this.add(mount(
                        posix.join(publicPath, ASSETS_DIRNAME_IN_DIST),
                        koaStatic(join(this.cwd, ASSETS_DIRNAME_IN_DIST))
                    ));
                }

                // serve sw-register.js & sw.js
                if (selectedMiddlewares.includes(INTERNAL_MIDDLEWARE.SERVICE_WORKER)
                    && serviceWorker && serviceWorker.swDest) {
                    let swFiles = [
                        basename(serviceWorker.swDest),
                        'sw-register.js'
                    ].map(f => posix.join(publicPath, f));
                    this.add(async (ctx, next) => {
                        let done = false;
                        if (swFiles.includes(ctx.path)) {
                            // Don't cache service-worker.js & sw-register.js.
                            ctx.set('Cache-Control', 'private, no-cache, no-store');
                            done = await send(ctx, ctx.path.substring(publicPath.length), {
                                root: this.cwd
                            });
                        }
                        if (!done) {
                            await next();
                        }
                    });
                }
            }

            if (selectedMiddlewares.includes(INTERNAL_MIDDLEWARE.SSR)) {
                this.add(c2k(ssrFactory(this.core)));
            }
        }

        return composeKoa(this.internalMiddlewares);
    }

    /**
     * compose middlewares into a chain.
     *
     * @return {Function} expressMiddleware
     */
    express(selectedMiddlewares = ALL_MIDDLEWARES) {
        if (!Array.isArray(selectedMiddlewares)) {
            selectedMiddlewares = [selectedMiddlewares];
        }

        let expressRouter = Router;
        let {router: {base}, build: {ssr, publicPath, compress}, serviceWorker, errorHandler} = this.config;
        base = removeTrailingSlash(base || '/');

        if (selectedMiddlewares.includes(INTERNAL_MIDDLEWARE.COMPRESSION)) {
            // gzip compression
            this.add(compression());
        }

        if (selectedMiddlewares.includes(INTERNAL_MIDDLEWARE.FAVICON)) {
            // serve favicon
            let faviconPath = posix.join(this.cwd, ASSETS_DIRNAME_IN_DIST, 'img/icons/favicon.ico');
            this.add(favicon(faviconPath));
        }

        if (selectedMiddlewares.includes(INTERNAL_MIDDLEWARE.TRAILING_SLASH)) {
            // Redirect without trailing slash.
            let rootRouter = expressRouter();
            rootRouter.get(
                base,
                (req, res, next) => {
                    let url = parse(req.url);
                    if (!url.pathname.endsWith('/')) {
                        res.redirect(301, url.pathname + '/' + (url.search || ''));
                    }
                    else {
                        next();
                    }
                }
            );
            this.add(rootRouter, true);
        }

        if (ssr) {
            /**
             * Add static files middleware only in prod mode,
             * because we already have webpack-dev-middleware in dev mode.
             * Don't need this middleware when CDN being used to serve static files.
             */
            if (this.isProd && !isFromCDN(publicPath)) {
                // Serve /static.
                if (selectedMiddlewares.includes(INTERNAL_MIDDLEWARE.STATIC)) {
                    let staticRouter = expressRouter();
                    staticRouter.get(
                        posix.join(publicPath, ASSETS_DIRNAME_IN_DIST, '*'),
                        staticFactory(publicPath)
                    );
                    this.add(staticRouter);
                    // Don't use etag or cache-control.
                    this.add(serveStatic(this.cwd, {
                        cacheControl: false,
                        etag: false
                    }));
                }

                // Serve sw-register.js & sw.js.
                if (selectedMiddlewares.includes(INTERNAL_MIDDLEWARE.SERVICE_WORKER)) {
                    if (serviceWorker && serviceWorker.swDest) {
                        let swFiles = [
                            basename(serviceWorker.swDest),
                            'sw-register.js'
                        ].map(f => posix.join(publicPath, f));
                        let swRouter = expressRouter();
                        swRouter.get(swFiles, staticFactory(publicPath));
                        this.add(swRouter);
                        // Use cache-control but not etag.
                        this.add(serveStatic(this.cwd, {
                            etag: false
                        }));
                    }
                }
            }

            // SSR middleware.
            if (selectedMiddlewares.includes(INTERNAL_MIDDLEWARE.SSR)) {
                this.add(ssrFactory(this.core));
            }
        }

        // Handle errors.
        if (selectedMiddlewares.includes(INTERNAL_MIDDLEWARE.ERROR)) {
            this.add(expressErrorFactory(errorHandler));
        }

        return compose(this.internalMiddlewares);
    }
}
