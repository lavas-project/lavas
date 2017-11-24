/**
 * @file utils.webpack.js
 * @author lavas
 */
import webpack from 'webpack';
import {utimes, outputFile} from 'fs-extra';

/**
 * start to compile with webpack, record the errors & warnings in process
 *
 * @param {Object|Array} config webpack config
 * @return {Promise} promise
 */
export function webpackCompile(config) {
    return new Promise((resolve, reject) => {
        webpack(config, (err, stats) => {
            if (err) {
                console.error(err.stack || err);
                if (err.details) {
                    console.error(err.details);
                }
                reject(err);
                return;
            }

            const info = stats.toJson();

            if (stats.hasErrors()) {
                console.error(info.errors);
                reject(info.errors);
                return;
            }

            if (stats.hasWarnings()) {
                console.warn(info.warnings);
            }

            resolve();
        });
    });
}

/**
 * write files to disk in dev mode
 *
 * @param {string} path file path
 * @param {string} content file content
 */
export async function writeFileInDev(path, content) {
    await outputFile(path, content, 'utf8');

    /**
     * hack for watchpack, solve the rebuilding problem in dev mode
     * https://github.com/webpack/watchpack/issues/25#issuecomment-287789288
     */
    let then = Date.now() / 1000 - 10;
    await utimes(path, then, then);
}

/**
 * add support for hot reload, such as adding plugins and modifying every entry
 *
 * @param {Object} config webpack config
 */
export function enableHotReload(config) {
    let {entry, name = 'client'} = config;

    Object.keys(entry).forEach(entryName => {
        let currentEntry = entry[entryName];
        if (Array.isArray(currentEntry)) {
            entry[entryName] = [...currentEntry,
                `webpack-hot-middleware/client?name=${name}&noInfo=true&reload=true`];
        }
    });
    config.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    );
}
