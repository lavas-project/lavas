/**
 * @file utils.workbox.js
 * @author lavas
 */
import {version} from 'workbox-sw/package.json';

/**
 * get workbox files
 *
 * @param {boolean} isProd is in production mode
 * @return {Array} files .js & .map
 */
export function getWorkboxFiles(isProd) {
    return [
        `workbox-sw.${isProd ? 'prod' : 'dev'}.v${version}.js`,
        `workbox-sw.${isProd ? 'prod' : 'dev'}.v${version}.js.map`
    ];
}
