/**
 * @file DevBuilder
 * @author lavas
 */

import {emptyDir, outputFile, copy} from 'fs-extra';
import {join} from 'path';

import {CONFIG_FILE} from '../constants';
import {webpackCompile} from '../utils/webpack';
import {distLavasPath} from '../utils/path';

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
        let {build, globals} = this.config;
        // clear dist/ first
        await emptyDir(build.path);

        await this.routeManager.buildRoutes();
        await this.writeRuntimeConfig();
        await this.writeFileToLavasDir(
            MIDDLEWARE_FILE,
            readFileSync(join(__dirname, `../templates/${MIDDLEWARE_FILE}`))
        );
        await this.writeFileToLavasDir(
            STORE_FILE,
            readFileSync(join(__dirname, `../templates/${STORE_FILE}`))
        );

        // SSR build process
        if (this.ssr) {
            console.log('[Lavas] SSR build starting...');
            // webpack client & server config
            let clientConfig = this.webpackConfig.client();
            let serverConfig = this.webpackConfig.server();

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
            console.log('[Lavas] SSR build completed.');
        }

        // SPA build process
        if (!this.ssr) {
            console.log('[Lavas] SPA build starting...');
            await webpackCompile(await this.createMPAConfig());
            console.log('[Lavas] SPA build completed.');
        }
    }
}
