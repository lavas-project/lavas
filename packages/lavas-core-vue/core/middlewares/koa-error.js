/**
 * @file koaError.js, error handler middleware for koa
 * @author lavas
 */

/**
 * generate error middleware
 *
 * @param {string} errPath errPath
 * @return {Function} koa middleware
 */
export default function ({errorPath, defaultErrorMessage, showRealErrorMessage}) {

    return async (ctx, next) => {
        if (ctx.req.lavasIgnoreFlag) {
            return await next();
        }
        try {
            await next();
        }
        catch (err) {
            console.log('[Lavas] error middleware catch error:');
            console.log(err);

            if (ctx.headerSent || !ctx.writable) {
                err.headerSent = true;
                return;
            }

            if (errorPath === ctx.path.replace(/\?.+$/, '')) {
                // if already in error procedure, then end this request immediately, avoid infinite loop
                ctx.res.end();
                return;
            }

            // clear headers
            ctx.res._headers = {};

            // redirect to the corresponding url
            ctx.redirect(`${errorPath}?error=${encodeURIComponent(showRealErrorMessage ? err.message : defaultErrorMessage)}`);

            ctx.res.end();
        }
    };
}
