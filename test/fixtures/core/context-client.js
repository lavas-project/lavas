/**
 * @file middleware
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

export function getClientContext(context, app) {
    let ctx = {
        isClient: true,
        app: app,
        store: context.store,
        route: context.to,
        from: context.from
    };
    const next = context.next;
    ctx.params = ctx.route.params || {};
    ctx.query = ctx.route.query || {};
    ctx.redirect = function (status, path, query) {
        if (!status) {
            return;
        }
        ctx._redirected = true; // Used in middleware
        // if only 1 or 2 arguments: redirect('/') or redirect('/', { foo: 'bar' })
        if (typeof status === 'string' && (typeof path === 'undefined' || typeof path === 'object')) {
            query = path || {};
            path = status;
            status = 302;
        }
        next({
            path,
            query,
            status
        });
    };

    return ctx;
}
