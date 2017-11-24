/**
 * @file utils.path.js
 * @author lavas
 */
import {join, posix} from 'path';
import {LAVAS_DIRNAME_IN_DIST, ASSETS_DIRNAME_IN_DIST} from '../constants';

/**
 * concat with lavas dir
 *
 * @param {string} rootDir rootDir
 * @return {string} resolved path
 */
export function distLavasPath(rootDir, path) {
    return join(rootDir, LAVAS_DIRNAME_IN_DIST, path);
}

/**
 * generate a relative path based on config
 * eg. static/js/[name].[hash].js
 *
 * @param {string} sourcePath source path
 * @return {string} relative path
 */
export function assetsPath(path) {
    return posix.join(ASSETS_DIRNAME_IN_DIST, path);
}

/**
 * resolve path with webpack alias
 *
 * @param {Object} alias alias object
 * @param {string} path path starts with alias
 * @return {string} resolved path
 */
export function resolveAliasPath(alias, path) {
    let matchedAliasKey = Object.keys(alias).find(aliasKey => path.startsWith(aliasKey));
    return matchedAliasKey ?
        join(alias[matchedAliasKey], path.substring(matchedAliasKey.length)) : path;
}
