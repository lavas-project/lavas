/**
 * @file index.js
 * @author lavas
 */

import Renderer from './renderer';
import ConfigReader from './config-reader';
import Builder from './builder';

import ssrFactory from './middlewares/ssr';
import koaErrorFactory from './middlewares/koaError';
import expressErrorFactory from './middlewares/expressError';
import staticFactory from './middlewares/static';

import ora from 'ora';

import {compose} from 'compose-middleware';
import composeKoa from 'koa-compose';
import c2k from 'koa-connect';
import mount from 'koa-mount';
import koaStatic from 'koa-static';
import send from 'koa-send';

import {Router} from 'express';
import serveStatic from 'serve-static';
import favicon from 'serve-favicon';
import compression from 'compression';

import {join, posix, basename} from 'path';
import EventEmitter from 'events';
import {parse} from 'url';
import {isFromCDN, removeTrailingSlash} from './utils/path';

import {ASSETS_DIRNAME_IN_DIST} from './constants';

export default class LavasCore extends EventEmitter {
    constructor(cwd = process.cwd()) {
        super();
        this.cwd = cwd;
    }

    /**
     * invoked before build & runAfterBuild, do something different in each senario
     *
     * @param {string} env NODE_ENV
     * @param {boolean} isInBuild is in build process
     */
    async init(env, isInBuild) {
        this.env = env;
        this.isProd = this.env === 'production';
        this.configReader = new ConfigReader(this.cwd, this.env);

        /**
         * in a build process, we need to read config by scan a directory,
         * but for online server after build, we just read config.json directly
         */
        if (isInBuild) {
            // scan directory
            this.config = await this.configReader.read();
        }
        else {
            // read config from config.json
            this.config = await this.configReader.readConfigFile();
        }

        this.internalMiddlewares = [];
        this.renderer = new Renderer(this);
        this.builder = new Builder(this);
    }

    /**
     * build in dev & prod mode
     *
     */
    async build() {
        let spinner = ora();

        spinner.start();
        if (this.isProd) {
            await this.builder.buildProd();
        }
        else {
            this.setupInternalMiddlewares();
            await this.builder.buildDev();
        }
        spinner.succeed(`[Lavas] ${this.env} build completed.`);
    }

    /**
     * setup some internal middlewares
     *
     */
    setupInternalMiddlewares() {
        // gzip compression
        this.internalMiddlewares.push(compression());
        // serve favicon
        let faviconPath = posix.join(this.cwd, ASSETS_DIRNAME_IN_DIST, 'img/icons/favicon.ico');
        this.internalMiddlewares.push(favicon(faviconPath));
    }

    /**
     * must run after build in prod mode
     *
     */
    async runAfterBuild() {
        this.setupInternalMiddlewares();
        this.renderer = new Renderer(this);
        // create with bundle & manifest
        await this.renderer.createWithBundle();
    }

    /**
     * compose all the middlewares
     *
     * @return {Function} koa middleware
     */
    koaMiddleware() {
        let {entry, build: {publicPath}, serviceWorker} = this.config;
        let ssrExists = entry.some(e => e.ssr);
        let entryBases = entry.map(e => removeTrailingSlash(e.base || '/'));

        // transform express/connect style middleware to koa style
        let middlewares = [
            koaErrorFactory(this),
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
            middlewares.push(c2k(ssrFactory(this)));
        }

        return composeKoa(middlewares);
    }

    /**
     * compose all the middlewares
     *
     * @return {Function} express middleware
     */
    expressMiddleware() {
        let {entry, build: {publicPath}, serviceWorker} = this.config;
        let ssrExists = entry.some(e => e.ssr);

        let middlewares = [
            ...this.internalMiddlewares
        ];

        // Redirect without trailing slash.
        let rootRouter = Router();
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
                let staticRouter = Router();
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
                let swRouter = Router();
                swRouter.get(swFiles, staticFactory(publicPath));
                middlewares.push(swRouter);
                // Use cache-control but not etag.
                middlewares.push(serveStatic(this.cwd, {
                    etag: false
                }));
            }

            middlewares.push(ssrFactory(this));
        }

        // Handle errors.
        middlewares.push(expressErrorFactory(this));

        return compose(middlewares);
    }

    /**
     * close builder in development mode
     *
     */
    async close() {
        await this.builder.close();
        console.log('[Lavas] lavas closed.');
    }

    /**
     * add flag to req which will be ignored by lavas middlewares
     *
     * @param {Request} req req
     */
    ignore(req) {
        req.lavasIgnoreFlag = true;
    }
}
