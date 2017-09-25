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
 * find html according to current route
 *
 * @param {string} entryName entryName
 * @return {Promise}
 */
async function getStaticHtml(cwd, entryName) {
    let entry = STATIC_HTML_CACHE.get(entryName);
    if (!entry) {
        entry = await readFile(join(cwd, `${entryName}.html`), 'utf8');
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
    let {cwd, config, isProd, renderer} = core;
    return async function (req, res, next) {
        let url = req.url;
        let matchedEntry = config.entry.find(entryConfig => matchUrl(entryConfig.routes, url));
        let {ssr: needSSR, name: entryName} = matchedEntry;

        if (isProd && !needSSR) {
            console.log(`[Lavas] route middleware: static ${url}`);
            res.end(await getStaticHtml(cwd, entryName));
        }
        else {
            console.log(`[Lavas] route middleware: ssr ${url}`);
            let matchedRenderer = await renderer.getRenderer(entryName);
            let ctx = {
                title: 'Lavas', // default title
                url,
                entryName,
                config, // mount config to ctx which will be used when rendering template
                req,
                res,
                error: err => next(err)
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
