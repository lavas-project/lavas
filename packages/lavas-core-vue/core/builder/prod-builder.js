/**
 * @file DevBuilder
 * @author lavas
 */

import {emptyDir, outputFile, copy, remove} from 'fs-extra';
import {join} from 'path';

import {copyWorkboxLibraries} from 'workbox-build';
import glob from 'glob'
import {CONFIG_FILE, ASSETS_DIRNAME_IN_DIST} from '../constants';
import {webpackCompile} from '../utils/webpack';
import {distLavasPath} from '../utils/path';
import Logger from '../utils/logger';

import BaseBuilder from './base-builder';

export default class ProdBuilder extends BaseBuilder {
    constructor(core) {
        super(core);
        this.writeFile = outputFile;
    }

    /**
     * build in production mode
     */
    async build() {
        let {build, globals, serviceWorker} = this.config;

        // clear dist/ first
        Logger.info('build', `start clearing ${build.path}...`, true);
        await emptyDir(build.path);
        Logger.info('build', `${build.path} cleared.`, true);

        Logger.info('build', 'start compiling routes...', true);
        await this.routeManager.buildRoutes();
        Logger.info('build', 'compiling routes completed.', true);

        Logger.info('build', 'start writing files to /.lavas...', true);
        await Promise.all([
            this.writeRuntimeConfig(),
            this.writeMiddleware(),
            this.writeStore()
        ])
        Logger.info('build', 'writing files to /.lavas completed', true);

        // SSR build process
        if (build.ssr) {

            // create config for both client & server side
            let clientConfig = await this.createSSRClientConfig();
            let serverConfig = await this.createSSRServerConfig();

            // build bundle renderer
            await this.renderer.build(clientConfig, serverConfig);

            /**
             * when running online server, renderer needs to use template and
             * replace some variables such as meta, config in it. so we need
             * to store some props in config.json.
             * NOTE: not all the props in config is needed. for now, only manifest
             * & assetsDir are required. some props such as globalDir are useless.
             */
            await copy(
                this.lavasPath(CONFIG_FILE),
                distLavasPath(build.path, CONFIG_FILE)
            );

            /**
             * Don't use copy-webpack-plugin to copy this kind of files,
             * otherwise these files will be added in the compilation of webpack.
             * It will let some plugins such as vue-ssr-client misuse them.
             * So just use fs.copy in such senario.
             */
            if (build.ssrCopy) {
                await Promise.all(build.ssrCopy.map(
                    async ({src, dest = src, options = {}}) => {
                        await copy(
                            join(globals.rootDir, src),
                            join(build.path, dest),
                            options
                        );
                    }
                ));
            }
        }
        // SPA build process
        else {
            await webpackCompile(await this.createSPAConfig(), build.stats);
        }

        if (serviceWorker.enable !== false) {
            // Copy workbox files to dist/static/workbox-v3.*.*/
            await copyWorkboxLibraries(join(build.path, ASSETS_DIRNAME_IN_DIST));
        }
    }
}
