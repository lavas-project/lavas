/**
 * @file utils.workbox.js
 * @author lavas
 */
import {basename} from 'path';

export const WORKBOX_PATH = require.resolve('workbox-sw');

/**
 * get workbox files
 *
 * @param {boolean} isProd is in production mode
 * @return {Array} files .js & .map
 */
export function getWorkboxFiles(isProd) {
    let filename = isProd
        ? basename(WORKBOX_PATH) : basename(WORKBOX_PATH).replace('prod', 'dev');
    return [
        filename,
        `${filename}.map`
    ];
}
