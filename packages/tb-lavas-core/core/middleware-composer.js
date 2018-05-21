/**
 * @file MiddlewareComposer.js
 * @author lavas
 */

import {join, posix} from 'path';
import {parse} from 'url';
import {removeTrailingSlash} from './utils/path';

import {ASSETS_DIRNAME_IN_DIST} from './constants';

import {compose} from 'compose-middleware';
import {Router} from 'express';
import favicon from 'serve-favicon';

import expressErrorFactory from './middlewares/express-error';

// enum of internal middlewares
const INTERNAL_MIDDLEWARE = {
    TRAILING_SLASH: 'trailing-slash',
    SERVICE_WORKER: 'service-worker',
    FAVICON: 'favicon',
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
        Object.assign(this.config, config);
        this.internalMiddlewares = [];
    }

    /**
     * setup some internal middlewares
     *
     */
    setup() {
        // serve favicon
        let faviconPath = posix.join(this.cwd, ASSETS_DIRNAME_IN_DIST, 'img/icons/favicon.ico');
        this.add(favicon(faviconPath));
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

        // Handle errors.
        if (selectedMiddlewares.includes(INTERNAL_MIDDLEWARE.ERROR)) {
            this.add(expressErrorFactory(errorHandler));
        }

        return compose(this.internalMiddlewares);
    }
}
