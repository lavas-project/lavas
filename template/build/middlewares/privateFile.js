/**
 * @file privateFileMiddlewareFactory.js
 * @author lavas
 */

/**
 * generate private file middleware
 * which prevents user from getting in touch with some private files
 *
 * @param {Object} core lavas core
 * @return {Function} koa middleware
 */
export default function (core) {
    let privateFiles = [
        'server.js',
        'package.json',
        '/lib/',
        '/node_modules/',
        '/lavas/'
    ];

    return async function (req, res, next) {
        if (privateFiles.find(file => req.url.startsWith(file))) {
            await next({status: 404});
        }
        else {
            await next();
        }
    };
}
