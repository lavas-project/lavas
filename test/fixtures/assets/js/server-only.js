console.log('This module should only be imported in server side!');

/**
 * the following `serverOnly` should only exist in server-bundle.js,
 * but not client-side(dist/main.[hash].js).
 */
module.export = {
    serverOnly: 1
};
