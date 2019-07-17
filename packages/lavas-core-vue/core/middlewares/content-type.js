/**
 * @file ContentTypeMiddlewareFactory.js
 * @author lavas
 */

/**
 * add content-type for unkonwn static files
 *
 * @return {Function} koa middleware
 */
export default function () {

    return function (req, res, next) {
        res.type('text/html')
        next();
    };
}
