/**
 * @file staticMiddlewareFactory.js
 * @author lavas
 */

import {posix} from 'path';

/**
 * remove publicPath in urls of static files
 *
 * @param {string} publicPath publicPath
 * @return {Function} koa middleware
 */
export default function (publicPath) {

    return function (req, res, next) {
        let originalUrl = req.url;
        req.url = req.url.substring(publicPath.length);
        next();
    };
}
