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
 * @param {string} path path
 * @return {string} resolved path
 */
export function distLavasPath(rootDir, path) {
    return join(rootDir, LAVAS_DIRNAME_IN_DIST, path);
}

/**
 * generate a relative path based on config
 * eg. static/js/[name].[hash].js
 *
 * @param {string} path source path
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
    return matchedAliasKey
        ? join(alias[matchedAliasKey], path.substring(matchedAliasKey.length)) : path;
}

/**
 * whether the publicPath is from cdn
 *
 * @param {string} publicPath publicPath
 * @return {boolean} is from cdn
 */
export function isFromCDN(publicPath) {
    return publicPath.startsWith('http://')
        || publicPath.startsWith('https://')
        || publicPath.startsWith('//');
}

/**
 * remove trailing slash
 *
 * @param {string} base base
 * @return {string} base without trailing slash
 */
export function removeTrailingSlash(base) {
    return base.endsWith('/')
        ? base.substring(0, base.length - 1) : base;
}

/**
 * convert camelcase to dash
 *
 * borrow from https://gist.github.com/youssman/745578062609e8acac9f
 * @param {string} str string in camel case
 * @return {string} dash string
 */
export function camelCaseToDash(str) {
    return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-')
        .toLowerCase();
}
