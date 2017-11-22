/**
 * @file ssrMiddlewareFactory.js
 * @author lavas
 */

import {readFile} from 'fs-extra';
import {join} from 'path';
import lruCache from 'lru-cache';
import {matchUrl} from '../utils/router';

const STATIC_HTML_CACHE = lruCache({
    max: 1000,
    maxAge: 1000 * 60 * 15
});

/**
 * find html content according to current entry
 *
 * @param {string} fileSystem fileSystem
 * @param {string} cwd cwd
 * @param {string} entryName entryName
 * @param {boolean} enableCache enable cache
 * @return {string} html content
 */
async function getStaticHtml(fileSystem, cwd, entryName, enableCache) {
    if (!enableCache) {
        return fileSystem.readFileSync(join(cwd, `dist/${entryName}.html`), 'utf8');
    }

    let entry = STATIC_HTML_CACHE.get(entryName);
    if (!entry) {
        if (fileSystem) {
            entry = fileSystem.readFileSync(join(cwd, `dist/${entryName}.html`), 'utf8');
        }
        else {
            entry = await readFile(join(cwd, `${entryName}.html`), 'utf8');
        }
        STATIC_HTML_CACHE.set(entryName, entry);
    }
    return entry;
}

/**
 * generate ssr middleware
 *
 * @param {Object} core lavas core
 * @return {Function} koa middleware
 */
export default function (core) {
    let {cwd, config, renderer, builder, isProd} = core;
    return async function (req, res, next) {
        if (req.lavasIgnoreFlag) {
            return next();
        }

        let url = req.url;
        let matchedEntry = config.entry.find(entryConfig => matchUrl(entryConfig.routes, url));
        if (!matchedEntry) {
            return next(new Error(`${url} not found`));
        }

        let {ssr: needSSR, name: entryName} = matchedEntry;

        if (!needSSR) {
            console.log(`[Lavas] route middleware: static ${url}`);
            let devFs = builder && builder.devMiddleware && builder.devMiddleware.fileSystem;
            res.end(await getStaticHtml(devFs, cwd, entryName, isProd));
        }
        else {
            console.log(`[Lavas] route middleware: ssr ${url}`);
            let matchedRenderer = await renderer.getRenderer(entryName);
            let errorHandler = err => next(err);
            let ctx = {
                title: 'Lavas', // default title
                url,
                entryName,
                config, // mount config to ctx which will be used when rendering template
                req,
                res,
                error: errorHandler
            };
            // render to string
            matchedRenderer.renderToString(ctx, (err, html) => {
                if (err) {
                    return next(err);
                }
                res.end(html);
            });
        }
    };
}
