/**
 * @file service-worker.js with workbox api
 * @desc [example](https://workbox-samples.glitch.me/examples/workbox-sw/)
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

/**
 * Import workbox-sw with `importScripts` function.
 * 1. Need adding publicPath manually.
 * 2. If the version of workbox updated, modification is also required.
 */
importScripts('/static/js/workbox-sw.prod.v2.1.2.js');

const workboxSW = new WorkboxSW({
    // cacheId: 'your-custom-cache-name',
    // directoryIndex: 'index.html',
    ignoreUrlParametersMatching: [/^utm_/],
    skipWaiting: true,
    clientsClaim: true
});

// Define precache injection point.
workboxSW.precache([]);

// Respond to navigation requests with appshell precached.
workboxSW.router.registerNavigationRoute('/game/appshell');

// Define runtime cache.
workboxSW.router.registerRoute(new RegExp('https://query\.yahooapis\.com/v1/public/yql'),
    workboxSW.strategies.networkFirst());

workboxSW.router.registerRoute(/^https:\/\/ss\d\.baidu\.com/, workboxSW.strategies.cacheFirst());
