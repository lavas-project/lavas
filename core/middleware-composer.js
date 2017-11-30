/**
 * @file MiddlewareComposer.js
 * @author lavas
 */

import {join, posix, basename} from 'path';
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

export default class MiddlewareComposer {
    constructor(core) {
        this.core = core;
        this.cwd = core.cwd;
        this.config = core.config;
        this.isProd = core.isProd;
        this.internalMiddlewares = [];
    }

    add(middleware) {
        if (typeof middleware !== 'function') {
            throw new Error('Middleware must be a function.');
        }
        this.internalMiddlewares.push(middleware);
    }

    clean() {
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
    koa() {
        const composeKoa = require('koa-compose');
        const c2k = require('koa-connect');
        const mount = require('koa-mount');
        const koaStatic = require('koa-static');
        const send = require('koa-send');

        let {entry, build: {publicPath}, serviceWorker, errorHandler} = this.config;
        let ssrExists = entry.some(e => e.ssr);
        let entryBases = entry.map(e => removeTrailingSlash(e.base || '/'));

        // transform express/connect style middleware to koa style
        let middlewares = [
            koaErrorFactory(errorHandler.errorPath),
            async (ctx, next) => {
                // koa defaults to 404 when it sees that status is unset
                ctx.status = 200;
                await next();
            },
            ...this.internalMiddlewares.map(c2k)
        ];

        // Redirect without trailing slash.
        middlewares.push(async (ctx, next) => {
            if (entryBases.includes(ctx.path)) {
                ctx.redirect(ctx.path + '/' + ctx.search);
            }
            else {
                await next();
            }
        });

        if (ssrExists) {
            /**
             * Add static files middleware only in prod mode,
             * because we already have webpack-dev-middleware in dev mode.
             * Don't need this middleware when CDN being used to serve static files.
             */
            if (this.isProd && !isFromCDN(publicPath)) {
                // serve /static
                middlewares.push(mount(
                    posix.join(publicPath, ASSETS_DIRNAME_IN_DIST),
                    koaStatic(join(this.cwd, ASSETS_DIRNAME_IN_DIST))
                ));

                // serve sw-register.js & sw.js
                let swFiles = [
                    basename(serviceWorker.swDest),
                    'sw-register.js'
                ].map(f => posix.join(publicPath, f));
                middlewares.push(async (ctx, next) => {
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
            middlewares.push(c2k(ssrFactory(this.core)));
        }

        return composeKoa(middlewares);
    }

    /**
     * compose middlewares into a chain.
     *
     * @return {Function} expressMiddleware
     */
    express() {
        let expressRouter = Router;
        let {entry, build: {publicPath}, serviceWorker, errorHandler} = this.config;
        let ssrExists = entry.some(e => e.ssr);

        let middlewares = Array.from(this.internalMiddlewares);

        // Redirect without trailing slash.
        let rootRouter = expressRouter();
        rootRouter.get(
            entry.map(e => removeTrailingSlash(e.base || '/')),
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
        middlewares.unshift(rootRouter);

        if (ssrExists) {
            /**
             * Add static files middleware only in prod mode,
             * because we already have webpack-dev-middleware in dev mode.
             * Don't need this middleware when CDN being used to serve static files.
             */
            if (this.isProd && !isFromCDN(publicPath)) {
                // Serve /static.
                let staticRouter = expressRouter();
                staticRouter.get(
                    posix.join(publicPath, ASSETS_DIRNAME_IN_DIST, '*'),
                    staticFactory(publicPath)
                );
                middlewares.push(staticRouter);
                // Don't use etag or cache-control.
                middlewares.push(serveStatic(this.cwd, {
                    cacheControl: false,
                    etag: false
                }));

                // Serve sw-register.js & sw.js.
                let swFiles = [
                    basename(serviceWorker.swDest),
                    'sw-register.js'
                ].map(f => posix.join(publicPath, f));
                let swRouter = expressRouter();
                swRouter.get(swFiles, staticFactory(publicPath));
                middlewares.push(swRouter);
                // Use cache-control but not etag.
                middlewares.push(serveStatic(this.cwd, {
                    etag: false
                }));
            }

            middlewares.push(ssrFactory(this.core));
        }

        // Handle errors.
        middlewares.push(expressErrorFactory(errorHandler.errorPath));

        return compose(middlewares);
    }
}
