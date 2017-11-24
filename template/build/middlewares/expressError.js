/**
 * @file expressError.js, error handler middleware for express
 * @author lavas
 */

/**
 * generate error middleware
 *
 * @param {Object} core lavas core
 * @return {Function} koa middleware
 */
export default function (core) {
    const errConfig = core.config.errorHandler;

    errConfig.statusCode = errConfig.statusCode || [];

    const errPaths = new Set([errConfig.target]);

    // add all paths to errPaths set
    Object.keys(errConfig.statusCode).forEach(key => {
        errPaths.add(errConfig.statusCode[key].target);
    });

    return async (err, req, res, next) => {
        // console.log('[Lavas] error middleware catch error: ', err);

        if (err == null) {
            return;
        }

        if (errPaths.has(req.url)) {
            // if already in error procedure, then end this request immediately, avoid infinite loop
            res.end();
            return;
        }

        if (err.status !== 404) {
            console.error(err);
        }

        // get the right target url
        let target = errConfig.target;
        if (errConfig.statusCode[err.status]) {
            target = errConfig.statusCode[err.status].target;
        }

        // redirect to the corresponding url
        res.writeHead(301, {Location: target});
        res.end();
    };
}
