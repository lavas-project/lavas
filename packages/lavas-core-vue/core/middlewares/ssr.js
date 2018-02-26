/**
 * @file ssrMiddlewareFactory.js
 * @author lavas
 */

import {readFile} from 'fs-extra';
import {join} from 'path';
import {matchUrl} from '../utils/router';
import Logger from '../utils/logger';

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
        let errorHandler = err => next(err);

        Logger.info('route middleware', `ssr ${url}`);

        let {err, html} = await renderer.render({
            url,
            req,
            res,
            error: errorHandler
        });

        if (err) {
            return next(err);
        }
        res.end(html);
    };
}
