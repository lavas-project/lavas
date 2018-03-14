/**
 * @file expressError.js, error handler middleware for express
 * @author lavas
 */

/**
 * generate error middleware
 *
 * @param {string} option.errPath errPath
 * @return {Function} koa middleware
 */
export default function ({errorPath, defaultErrorMessage, showRealErrorMessage}) {

    return async (err, req, res, next) => {
        if (req.lavasIgnoreFlag) {
            return next();
        }

        console.log('[Lavas] error middleware catch error:');
        console.log(err);

        if (errorPath === req.url.replace(/\?.+$/, '')) {
            // if already in error procedure, then end this request immediately, avoid infinite loop
            res.end();
            return;
        }

        // redirect to the corresponding url
        let target = `${errorPath}?error=${encodeURIComponent(showRealErrorMessage ? err.message : defaultErrorMessage)}`;
        if (errorPath) {
            res.writeHead(302, {Location: target});
        }

        res.end();
    };
}
