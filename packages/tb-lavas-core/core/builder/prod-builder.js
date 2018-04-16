/**
 * @file DevBuilder
 * @author lavas
 */

import {emptyDir, outputFile, copy, remove} from 'fs-extra';
import {join} from 'path';

import {copyWorkboxLibraries} from 'workbox-build';
import glob from 'glob';

import {ASSETS_DIRNAME_IN_DIST} from '../constants';
import {webpackCompile} from '../utils/webpack';

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
        let {build, globals, entries: entriesConfig, serviceWorker} = this.config;

        if (build.ssr && entriesConfig.length !== 0) {
            throw new Error('[Lavas] Multi Entries cannot use SSR mode. Try to set ssr to `false`');
            return;
        }

        // clear dist/ first
        await emptyDir(build.path);

        if (serviceWorker.enable !== false) {
            // empty previous version
            let workboxDirs = glob.sync(join(this.cwd, ASSETS_DIRNAME_IN_DIST, 'workbox-v*'));
            if (workboxDirs.length !== 0) {
                await Promise.all(workboxDirs.map(async dir => await remove(dir)));
            }
            // copy current version
            await copyWorkboxLibraries(join(this.cwd, ASSETS_DIRNAME_IN_DIST));
        }

        await this.routeManager.buildRoutes();

        let writeTasks = [
            this.writeRuntimeConfig(),
            this.writeMiddleware(),
            this.writeStore()
        ];

        if (entriesConfig.length !== 0) {
            writeTasks.push(this.writeLavasLink());
        }

        await Promise.all(writeTasks);

        // SPA build process
        let mode = entriesConfig.length === 0 ? 'SPA' : 'MPA';
        console.log(`[Lavas] ${mode} build starting...`);
        await webpackCompile(await this.createSPAConfig(false, mode === 'SPA'));
        console.log(`[Lavas] ${mode} build completed.`);
    }
}
