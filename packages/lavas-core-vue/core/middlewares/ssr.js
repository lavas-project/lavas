/**
 * @file ssrMiddlewareFactory.js
 * @author lavas
 */

import Logger from '../utils/logger';

/**
 * generate ssr middleware
 *
 * @param {Object} core lavas core
 * @return {Function} koa middleware
 */
export default function (core) {
    return async function (req, res, next) {
        if (req.lavasIgnoreFlag) {
            return next();
        }

        let url = req.url;
        let errorHandler = err => next(err);

        Logger.info('route middleware', `ssr ${url}`);

        let {err, html} = await core.renderer.render({
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
