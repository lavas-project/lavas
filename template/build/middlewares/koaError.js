/**
 * @file koaError.js, error handler middleware for koa
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

    return async (ctx, next) => {
        try {
            await next();
        }
        catch (err) {
            // console.log('[Lavas] error middleware catch error: ', err);

            if (err == null) {
                return;
            }

            if (ctx.headerSent || !ctx.writable) {
                err.headerSent = true;
                return;
            }

            if (errPaths.has(ctx.path)) {
                // if already in error procedure, then end this request immediately, avoid infinite loop
                ctx.res.end();
                return;
            }

            if (err.status !== 404) {
                console.error(err);
            }

            // clear headers
            ctx.res._headers = {};

            // get the right target url
            let target = errConfig.target;
            if (errConfig.statusCode[err.status]) {
                target = errConfig.statusCode[err.status].target;
            }

            // redirect to the corresponding url
            ctx.redirect(target);
            ctx.res.end();
        }
    };
}
