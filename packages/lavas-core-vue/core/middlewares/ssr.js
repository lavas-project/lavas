/**
 * @file ssrMiddlewareFactory.js
 * @author lavas
 */

import {readFile} from 'fs-extra';
import {join} from 'path';
import {matchUrl} from '../utils/router';

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

        console.log(`[Lavas] route middleware: ssr ${url}`);
        let matchedRenderer = await renderer.getRenderer();
        let errorHandler = err => next(err);
        let ctx = {
            title: 'Lavas', // default title
            url,
            config: builder && builder.config || config, // mount config to ctx which will be used when rendering template
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
    };
}
