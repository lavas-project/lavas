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
export default function (errPath) {

    return async (ctx, next) => {
        if (ctx.req.lavasIgnoreFlag) {
            return await next();
        }
        try {
            await next();
        }
        catch (err) {
            let errorMsg = 'Internal Server Error';
            if (err.status !== 404) {
                console.log('[Lavas] error middleware catch error:');
                console.log(err);
            }
            else {
                errorMsg = `${ctx.req.url} not found`;
                console.log(errorMsg);
            }

            if (ctx.headerSent || !ctx.writable) {
                err.headerSent = true;
                return;
            }

            if (errPath === ctx.path.replace(/\?.+$/, '')) {
                // if already in error procedure, then end this request immediately, avoid infinite loop
                ctx.res.end();
                return;
            }

            // clear headers
            ctx.res._headers = {};

            // redirect to the corresponding url
            ctx.redirect(`${errPath}?error=${encodeURIComponent(errorMsg)}`);

            ctx.res.end();
        }
    };
}
