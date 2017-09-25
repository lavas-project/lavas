/**
 * @file middleware
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

export async function middlewareSeries(promises, context) {
    if (context._redirected) {
        return;
    }

    for (let i = 0; i < promises.length; i++) {
        await promisify(promises[i], context);
    }
}

export function promisify(fn, context) {
    let promise;

    if (fn.length === 2) {
        // fn(context, callback)
        promise = new Promise((resolve, reject) => {
            fn(context, (err, data) => {
                if (err) {
                    // 错误处理
                    context.error(err);
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    else {
        promise = fn(context);
        if (!promise || (!(promise instanceof Promise) && (typeof promise.then !== 'function'))) {
            promise = Promise.resolve(promise);
        }
    }

    return promise;
}

export function urlJoin(...args) {
    return args.join('/').replace(/\/+/g, '/');
}

