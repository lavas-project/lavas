/**
 * @file utils.webpack.js
 * @author lavas
 */
import webpack from 'webpack';
import {join} from 'path';
import {utimes, outputFile, readFile} from 'fs-extra';
import template from 'lodash.template';

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
                    err.details.forEach(detail => console.error(detail));
                }
                reject(err);
                return;
            }

            const info = stats.toJson();

            if (stats.hasErrors()) {
                info.errors.forEach(error => console.error(error));
                reject(info.errors);
                return;
            }

            if (stats.hasWarnings()) {
                info.warnings.forEach(warning => console.warn(warning));
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
 * @param {string} dir directory for hot-reload.js
 * @param {Object} config webpack config
 * @param {boolean} subscribeReload whether subscribe reload action
 */
export async function enableHotReload(dir, config, subscribeReload = false) {
    let {entry, plugins, name: compilerName} = config;

    let hotReloadEntryTemplate = join(__dirname, '../templates/entry-hot-reload.tmpl');
    let hotReloadEntryPath = join(dir, `${compilerName}-hot-reload.js`);
    let templateContent = template(await readFile(hotReloadEntryTemplate, 'utf8'))({
        compilerName,
        subscribeReload
    });

    // generate .lavas/xxx-hot-reload.js
    await writeFileInDev(hotReloadEntryPath, templateContent);

    // add hot-reload entry in every entry
    Object.keys(entry).forEach(entryName => {
        let currentEntry = entry[entryName];
        if (Array.isArray(currentEntry)) {
            entry[entryName] = [hotReloadEntryPath, ...currentEntry];
        }
    });

    // add relative plugins
    plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    );
}

/**
 * remove templatedPath which contains [hash] [chunkhash] and [contenthash] in filenames
 *
 * @param {string} path original path
 * @return {string} path path without templated path
 */
export function removeTemplatedPath(path) {
    return path.replace(/\[(chunkhash|contenthash|hash)(:\d?)?\]\./g, '')
}
