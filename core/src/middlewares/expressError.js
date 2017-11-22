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

    const errPath = core.config.errorHandler.errorPath;

    return async (err, req, res, next) => {
        if (req.lavasIgnoreFlag) {
            return next();
        }

        let errorMsg = 'Internal Server Error';
        if (err.status !== 404) {
            console.log('[Lavas] error middleware catch error:');
            console.log(err);
        }
        else {
            errorMsg = `${req.url} not found`;
            console.log(errorMsg);
        }

        if (errPath === req.url) {
            // if already in error procedure, then end this request immediately, avoid infinite loop
            res.end();
            return;
        }

        // redirect to the corresponding url
        let target = `${errPath}?error=${encodeURIComponent(errorMsg)}`;
        if (errPath) {
            res.writeHead(301, {Location: target});
        }

        res.end();
    };
}
