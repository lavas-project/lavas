/**
 * @file staticMiddlewareFactory.js
 * @author lavas
 */

/**
 * remove publicPath in urls of static files
 *
 * @param {string} publicPath publicPath
 * @return {Function} koa middleware
 */
export default function (publicPath) {

    return function (req, res, next) {
        req.url = req.url.substring(publicPath.length);
        next();
    };
}
