/**
 * @file DevBuilder
 * @author lavas
 */

import webpack from 'webpack';
import MFS from 'memory-fs';
import chokidar from 'chokidar';
import {pathExists} from 'fs-extra';
import {join, posix} from 'path';

import historyMiddleware from 'connect-history-api-fallback';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import SkeletonWebpackPlugin from 'vue-skeleton-webpack-plugin';

import {LAVAS_CONFIG_FILE} from '../constants';
import {enableHotReload, writeFileInDev} from '../utils/webpack';
import {routes2Reg} from '../utils/router';

import BaseBuilder from './base-builder';

export default class DevBuilder extends BaseBuilder {
    constructor(core) {
        super(core);
        // chokidar watchers
        this.watchers = [];

        // webpack-dev-middleware
        this.devMiddleware = null;

        // server webpack watch
        this.serverWatching = null;

        // override writeFile function
        this.writeFile = writeFileInDev;

        this.sharedCache = {};
    }

    /**
     * set chokidar watchers, following directories and files will be watched:
     * /pages, /config, /entries/[entry]/index.html.tmpl
     *
     * @param {string|Array.<string>} paths paths
     * @param {string|Array.<string>} events events
     * @param {Function} callback callback
     */
    addWatcher(paths, events, callback) {
        if (!Array.isArray(events)) {
            events = [events];
        }
        let watcher = chokidar.watch(paths, {ignoreInitial: true});
        events.forEach(event => {
            watcher.on(event, callback);
        });
        this.watchers.push(watcher);
    }

    reloadClient() {
        // publish reload event to old client
        if (this.oldHotMiddleware) {
            this.oldHotMiddleware.publish({
                action: 'reload'
            });
        }
    }

    /**
     * reload global config
     */
    startRebuild() {
        console.log('[Lavas] config changed, start rebuilding...');
        this.core.emit('start-rebuild');
    }

    /**
     * add skeleton routes in development mode
     *
     * @param {Object} clientConfig webpack client config
     */
    addSkeletonRoutes(clientConfig) {
        let {globals: {rootDir}, entry} = this.config;
        // only pages in MPA need skeleton
        let entriesWithSkeleton = entry.filter(async e => {
            let {name, ssr} = e;
            let skeletonPath = join(rootDir, `entries/${name}/Skeleton.vue`);
            return !ssr && await pathExists(skeletonPath);
        });

        clientConfig.module.rules.push(SkeletonWebpackPlugin.loader({
            resource: entriesWithSkeleton.map(e => join(rootDir, `.lavas/${e.name}/router`)),
            options: {
                entry: entriesWithSkeleton.map(e => e.name),
                importTemplate: 'import [nameHash] from \'@/entries/[name]/Skeleton.vue\';',
                routePathTemplate: '/skeleton-[name]',
                insertAfter: 'let routes = ['
            }
        }));
    }

    /**
     * watch some directories and files such as /pages, lavas.config.js
     */
    addWatchers() {
        let {globals, build} = this.config;

        // use chokidar to rebuild routes
        let pagesDir = join(globals.rootDir, 'pages');
        this.addWatcher(pagesDir, ['add', 'unlink'], async () => {
            await this.routeManager.buildRoutes();
        });

        // watch files provides by user
        if (build.watch) {
            this.addWatcher(build.watch, 'change', this.startRebuild.bind(this));
        }

        // watch lavas.config.js, rebuild whole process
        let configDir = join(globals.rootDir, LAVAS_CONFIG_FILE);
        this.addWatcher(configDir, 'change', this.startRebuild.bind(this));
    }

    /**
     * build in development mode
     */
    async build() {
        this.isDev = true;
        let mpaConfig;
        let clientConfig;
        let serverConfig;
        let hotMiddleware;
        let clientCompiler; // compiler for client in ssr and mpa
        let serverCompiler; // compiler for server in ssr
        let clientMFS;
        let noop = () => {};

        await this.routeManager.buildRoutes();
        await this.writeLavasLink();
        await this.writeRuntimeConfig();

        if (this.ssrExists) {
            console.log('[Lavas] SSR build starting...');
            clientConfig = this.webpackConfig.client();
            serverConfig = this.webpackConfig.server();
            let serverMFS = new MFS();

            // pass addWatcher & reloadClient to renderer
            this.renderer.addWatcher = this.addWatcher.bind(this);
            this.renderer.reloadClient = this.reloadClient.bind(this);
            await this.renderer.build(clientConfig, serverConfig);
            this.renderer.serverMFS = serverMFS;

            serverCompiler = webpack(serverConfig);
            serverCompiler.outputFileSystem = serverMFS;

            this.serverWatching = serverCompiler.watch({}, async (err, stats) => {
                if (err) {
                    throw err;
                }
                stats = stats.toJson();
                if (stats.errors.length) {
                    for (let error of stats.errors) {
                        console.error(error);
                    }
                    return;
                }
                await this.renderer.refreshFiles();
            });
        }

        if (this.mpaExists) {
            console.log('[Lavas] MPA build starting...');
            // create mpa config first
            mpaConfig = await this.createMPAConfig(true);

            // enable hotreload in every entry in dev mode
            await enableHotReload(this.lavasPath(), mpaConfig, true);

            // add skeleton routes
            this.addSkeletonRoutes(mpaConfig);
        }

        // create a compiler based on mpa config
        clientCompiler = webpack([clientConfig, mpaConfig].filter(config => config));
        clientCompiler.cache = this.sharedCache;

        this.devMiddleware = webpackDevMiddleware(clientCompiler, {
            publicPath: this.config.build.publicPath,
            noInfo: true
        });

        // set memory-fs used by devMiddleware
        clientMFS = this.devMiddleware.fileSystem;
        clientCompiler.outputFileSystem = clientMFS;
        if (this.ssrExists) {
            this.renderer.clientMFS = clientMFS;
        }

        hotMiddleware = webpackHotMiddleware(clientCompiler, {
            heartbeat: 5000,
            log: noop
        });
        /**
         * TODO: hot reload for html
         * html-webpack-plugin has a problem with webpack 3.x.
         * the relative ISSUE: https://github.com/vuejs-templates/webpack/issues/751#issuecomment-309955295
         *
         * before the problem solved, there's no page reload
         * when the html-webpack-plugin template changes in webpack 3.x
         */
        clientCompiler.plugin('compilation', compilation => {
            compilation.plugin('html-webpack-plugin-after-emit', (data, cb) => {
                // trigger reload action, which will be used in hot-reload-client.js
                hotMiddleware.publish({
                    action: 'reload'
                });
                cb();
            });
        });

        /**
         * add html history api support:
         * in mpa, we use connect-history-api-fallback middleware
         * in ssr, ssr middleware will handle it instead
         */
        if (!this.ssrExists) {
            let mpaEntries = this.config.entry.filter(e => !e.ssr);
            let rewrites = mpaEntries
                .map(entry => {
                    let {name, routes, base} = entry;
                    return {
                        from: routes2Reg(routes),
                        to: posix.join(base, `/${name}.html`)
                    };
                });
            /**
             * we should put this middleware in front of dev middleware since
             * it will rewrite req.url to xxx.html based on options.rewrites
             */
            this.core.middlewareComposer.add(historyMiddleware({
                htmlAcceptHeaders: ['text/html'],
                disableDotRule: false, // ignore paths with dot inside
                // verbose: true,
                rewrites
            }));
        }

        // add dev & hot-reload middlewares
        this.core.middlewareComposer.add(this.devMiddleware);
        this.core.middlewareComposer.add(hotMiddleware);

        // wait until webpack building finished
        await new Promise(resolve => {
            this.devMiddleware.waitUntilValid(async () => {
                if (this.mpaExists) {
                    console.log('[Lavas] MPA build completed.');
                }
                if (this.ssrExists) {
                    await this.renderer.refreshFiles();
                    console.log('[Lavas] SSR build completed.');
                }

                // publish reload event to old client
                if (this.oldHotMiddleware) {
                    this.oldHotMiddleware.publish({
                        action: 'reload'
                    });
                }
                // save current hotMiddleware
                this.oldHotMiddleware = hotMiddleware;
                resolve();
            });
        });

        this.addWatchers();
    }

    /**
     * close watchers and some middlewares before rebuild
     *
     */
    async close() {
        // close chokidar watchers
        if (this.watchers && this.watchers.length) {
            this.watchers.forEach(watcher => {
                watcher.close();
            });
            this.watchers = [];
        }
        // close devMiddleware
        if (this.devMiddleware) {
            await new Promise(resolve => {
                this.devMiddleware.close(() => resolve());
            });
        }
        // stop serverCompiler watching in ssr mode
        if (this.serverWatching) {
            await new Promise(resolve => {
                this.serverWatching.close(() => resolve());
            });
            this.serverWatching = null;
        }
    }
}
