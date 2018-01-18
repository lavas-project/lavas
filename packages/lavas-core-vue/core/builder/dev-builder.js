/**
 * @file DevBuilder
 * @author lavas
 */

import webpack from 'webpack';
import MFS from 'memory-fs';
import chokidar from 'chokidar';
import {readFileSync} from 'fs-extra';
import {join, posix} from 'path';
import {debounce} from 'lodash';

import historyMiddleware from 'connect-history-api-fallback';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import SkeletonWebpackPlugin from 'vue-skeleton-webpack-plugin';

import {LAVAS_CONFIG_FILE, STORE_FILE, DEFAULT_ENTRY_NAME, DEFAULT_SKELETON_PATH} from '../constants';
import {enableHotReload, writeFileInDev, removeTemplatedPath} from '../utils/webpack';
import {routes2Reg} from '../utils/router';
import {isFromCDN} from '../utils/path';

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
     * process lavas config
     *
     * @param {Object} config lavas config
     */
    processConfig(config) {
        // in dev mode, ignore CDN publicPath and use default '/' instead.
        config.build.publicPath = isFromCDN(config.build.publicPath)
            ? '/' : config.build.publicPath;

        /**
         * in dev mode, remove templatedPath which contains [hash] [chunkhash] and [contenthash] in filenames
         * https://github.com/webpack/webpack/issues/1914#issuecomment-174171709
         */
        Object.keys(config.build.filenames).forEach(key => {
            config.build.filenames[key] = removeTemplatedPath(config.build.filenames[key]);
        });
    }

    /**
     * set chokidar watchers, following directories and files will be watched:
     * /pages, /config, /core/index.html.tmpl
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
        let {globals, build} = this.config;
        let skeletonRelativePath = build.skeleton && build.skeleton.path || DEFAULT_SKELETON_PATH;
        clientConfig.module.rules.push(SkeletonWebpackPlugin.loader({
            resource: [join(globals.rootDir, `.lavas/router`)],
            options: {
                entry: [DEFAULT_ENTRY_NAME],
                importTemplate: `import [nameHash] from '@/${skeletonRelativePath}';`,
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
        let rebuildRoutes = debounce(async () => {
            await this.routeManager.buildRoutes();
        }, 200);
        this.addWatcher(pagesDir, ['add', 'unlink'], rebuildRoutes);

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
        let spaConfig;
        let clientConfig;
        let serverConfig;
        let hotMiddleware;
        let clientCompiler; // compiler for client in ssr and spa
        let serverCompiler; // compiler for server in ssr
        let clientMFS;
        let ssrEnabled = this.config.build.ssr;

        await this.routeManager.buildRoutes();
        await this.writeRuntimeConfig();
        await this.writeMiddleware();
        await this.writeFileToLavasDir(
            STORE_FILE,
            readFileSync(join(__dirname, `../templates/${STORE_FILE}`))
        );

        // SSR build process
        if (ssrEnabled) {
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
        // SPA build process
        else {
            console.log('[Lavas] SPA build starting...');
            // create spa config first
            spaConfig = await this.createSPAConfig(true);

            // enable hotreload in every entry in dev mode
            await enableHotReload(this.lavasPath(), spaConfig, true);

            // add skeleton routes
            if (this.skeletonEnabled) {
                this.addSkeletonRoutes(spaConfig);
            }
        }

        // create a compiler based on spa config
        clientCompiler = webpack([clientConfig, spaConfig].filter(config => config));
        clientCompiler.cache = this.sharedCache;

        // prefix all the assets paths with publicPath in MFS
        this.devMiddleware = webpackDevMiddleware(clientCompiler, {
            publicPath: this.config.build.publicPath,
            noInfo: true,
            stats: false,
            logLevel: 'silent'
        });

        // set memory-fs used by devMiddleware
        clientMFS = this.devMiddleware.fileSystem;
        clientCompiler.outputFileSystem = clientMFS;
        if (ssrEnabled) {
            this.renderer.clientMFS = clientMFS;
        }

        hotMiddleware = webpackHotMiddleware(clientCompiler, {
            heartbeat: 2500,
            log: false
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
         * in spa, we use connect-history-api-fallback middleware
         * in ssr, ssr middleware will handle it instead
         */
        if (!ssrEnabled) {
            /**
             * we should put this middleware in front of dev middleware since
             * it will rewrite req.url to xxx.html based on options.rewrites
             */
            this.core.middlewareComposer.add(historyMiddleware({
                htmlAcceptHeaders: ['text/html'],
                disableDotRule: false, // ignore paths with dot inside
                // verbose: true,
                index: `${this.config.build.publicPath}${DEFAULT_ENTRY_NAME}.html`
            }));
        }

        // add dev & hot-reload middlewares
        this.core.middlewareComposer.add(this.devMiddleware);
        this.core.middlewareComposer.add(hotMiddleware);

        // wait until webpack building finished
        await new Promise(resolve => {
            this.devMiddleware.waitUntilValid(async () => {
                if (!ssrEnabled) {
                    console.log('[Lavas] SPA build completed.');
                }
                else {
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
