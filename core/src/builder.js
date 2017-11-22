/**
 * @file builder.js
 * @author lavas
 */

import RouteManager from './route-manager';
import WebpackConfig from './webpack';

import webpack from 'webpack';
import MFS from 'memory-fs';
import chokidar from 'chokidar';
import template from 'lodash.template';
import {emptyDir, readFile, outputFile, pathExists, copy} from 'fs-extra';
import {join, posix} from 'path';

import historyMiddleware from 'connect-history-api-fallback';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import SkeletonWebpackPlugin from 'vue-skeleton-webpack-plugin';

import {CONFIG_FILE, TEMPLATE_HTML, LAVAS_CONFIG_FILE} from './constants';
import {webpackCompile, enableHotReload, writeFileInDev} from './utils/webpack';
import {distLavasPath, assetsPath} from './utils/path';
import {routes2Reg} from './utils/router';
import * as JsonUtil from './utils/json';
import templateUtil from './utils/template';

function templatesPath(path) {
    return join(__dirname, 'templates', path);
}

export default class Builder {
    constructor(core) {
        this.core = core;
        this.env = core.env;
        this.cwd = core.cwd;
        this.lavasDir = join(core.config.globals.rootDir, './.lavas');
        this.renderer = core.renderer;
        this.watchers = [];
        this.devMiddleware = null;
        this.sharedCache = {};
        this.init(core.config);
    }

    init(config) {
        this.config = config;
        this.webpackConfig = new WebpackConfig(config, this.env);
        this.routeManager = new RouteManager(config, this.env);
        this.ssrExists = config.entry.some(e => e.ssr);
        this.mpaExists = config.entry.some(e => !e.ssr);
    }

    /**
     * create an entry file for a skeleton component
     *
     * @param {string} entryName entryName
     * @param {string} skeletonPath used as import
     * @return {string} entryPath
     */
    async createSkeletonEntry(entryName, skeletonPath) {
        const skeletonEntryTemplate = templatesPath('entry-skeleton.tpl');
        // .lavas/${entryName}/skeleton.js
        let entryPath = join(this.lavasDir, `${entryName}/skeleton.js`);

        let writeFile = this.isDev ? writeFileInDev : outputFile;
        await writeFile(
            entryPath,
            template(await readFile(skeletonEntryTemplate, 'utf8'))({
                skeleton: {
                    path: skeletonPath
                }
            })
        );

        return entryPath;
    }

    /**
     * create html template for entry
     *
     * @param {string} sourcePath sourcePath
     * @param {string} targetPath targetPath
     * @param {Object} baseUrl    user's base url
     */
    async createHtmlTemplate(sourcePath, targetPath, baseUrl = '/') {
        let writeFile = this.isDev ? writeFileInDev : outputFile;
        let clientTemplateContent = templateUtil.client(await readFile(sourcePath, 'utf8'), baseUrl);
        await writeFile(targetPath, clientTemplateContent);
    }

    /**
     * use html webpack plugin
     *
     * @param {Object} mpaConfig mpaConfig
     * @param {string} entryName entryName
     * @param {string} baseUrl entry base url
     */
    async addHtmlPlugin(mpaConfig, entryName, baseUrl) {
        // allow user to provide a custom HTML template
        let rootDir = this.config.globals.rootDir;
        let htmlFilename = `${entryName}.html`;
        let customTemplatePath = join(rootDir, `entries/${entryName}/${TEMPLATE_HTML}`);

        if (!await pathExists(customTemplatePath)) {
            throw new Error(`${TEMPLATE_HTML} required for entry: ${entryName}`);
        }

        let realTemplatePath = join(this.lavasDir, `${entryName}/${TEMPLATE_HTML}`);
        await this.createHtmlTemplate(customTemplatePath, realTemplatePath, baseUrl);

        // add html webpack plugin
        mpaConfig.plugins.unshift(new HtmlWebpackPlugin({
            filename: htmlFilename,
            template: realTemplatePath,
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            },
            favicon: assetsPath('img/icons/favicon.ico'),
            chunksSortMode: 'dependency',
            cache: false,
            chunks: ['manifest', 'vue', 'vendor', entryName],
            config: this.config // use config in template
        }));

        // watch template in development mode
        if (this.isDev) {
            this.addWatcher(customTemplatePath, 'change', async () => {
                await this.createHtmlTemplate(customTemplatePath, realTemplatePath, baseUrl);
            });
        }
    }

    /**
     * create a webpack config and compile with it
     *
     * @return {Object} mpaConfig webpack config for MPA
     */
    async createMPAConfig() {
        let rootDir = this.config.globals.rootDir;

        // create mpa config based on client config
        let mpaConfig = this.webpackConfig.client();
        let skeletonEntries = {};

        // set context and clear entries
        mpaConfig.entry = {};
        mpaConfig.name = 'mpaclient';
        mpaConfig.context = rootDir;

        /**
         * for each module needs prerendering, we will:
         * 1. add a html-webpack-plugin to output a relative HTML file
         * 2. create an entry if a skeleton component is provided
         */
        await Promise.all(this.config.entry.map(async entryConfig => {
            let {name: entryName, ssr: needSSR, base: baseUrl} = entryConfig;

            if (!needSSR) {
                // set client entry first
                mpaConfig.entry[entryName] = [`./entries/${entryName}/entry-client.js`];

                // add html-webpack-plugin
                await this.addHtmlPlugin(mpaConfig, entryName, baseUrl);

                // if skeleton provided, we need to create an entry
                let skeletonPath = join(rootDir, `entries/${entryName}/Skeleton.vue`);
                let skeletonImportPath = `@/entries/${entryName}/Skeleton.vue`;
                if (await pathExists(skeletonPath)) {
                    let entryPath = await this.createSkeletonEntry(entryName, skeletonImportPath);
                    skeletonEntries[entryName] = [entryPath];
                }
            }
        }));

        if (Object.keys(skeletonEntries).length) {
            // when ssr skeleton, we need to extract css from js
            let skeletonConfig = this.webpackConfig.server({cssExtract: true});
            // remove vue-ssr-client plugin
            skeletonConfig.plugins.pop();
            skeletonConfig.entry = skeletonEntries;

            // add skeleton plugin
            mpaConfig.plugins.push(new SkeletonWebpackPlugin({
                webpackConfig: skeletonConfig
            }));
        }

        // enable hotreload in every entry in dev mode
        if (this.isDev) {
            await enableHotReload(this.lavasDir, mpaConfig, true);
        }

        return mpaConfig;
    }

    /**
     * write config.json which will be used in prod mode
     *
     * @param {Object} config config
     */
    async writeConfigFile(config) {
        let configFilePath = distLavasPath(config.build.path, CONFIG_FILE);
        await outputFile(configFilePath, JsonUtil.stringify(config));
    }

    /**
     * write LavasLink component
     */
    async writeLavasLink() {
        let writeFile = this.isDev ? writeFileInDev : outputFile;
        let lavasLinkTemplate = await readFile(templatesPath('LavasLink.js.tmpl'), 'utf8');
        await writeFile(join(this.lavasDir, 'LavasLink.js'), template(lavasLinkTemplate)({
            entryConfig: JsonUtil.stringify(this.config.entry)
        }));
    }

    /**
     * inject routes into service-worker.js.tmpl for later use
     */
    async injectEntriesToSW() {
        // add entryConfig to service-worker.tmpl.js
        let rawTemplate = await readFile(templatesPath('service-worker.js.tmpl'));
        let swTemplateContent = template(rawTemplate, {
            evaluate: /{{([\s\S]+?)}}/g,
            interpolate: /{{=([\s\S]+?)}}/g,
            escape: /{{-([\s\S]+?)}}/g
        })({
            entryConfig: JsonUtil.stringify(this.config.entry)
        });
        let swTemplateFilePath = templatesPath('service-worker-real.js.tmpl');
        await outputFile(swTemplateFilePath, swTemplateContent);
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
                importTemplate: 'import [nameCap] from \'@/entries/[name]/Skeleton.vue\';',
                routePathTemplate: '/skeleton-[name]',
                insertAfter: 'let routes = ['
            }
        }));
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
     * rebuild in development mode
     */
    async rebuild() {
        console.log('[Lavas] config changed, start rebuilding...');
        let newConfig = await this.core.configReader.read();
        this.core.config = newConfig;
        this.init(newConfig);
        this.core.internalMiddlewares = [];
        this.core.emit('rebuild');
    }

    /**
     * build in development mode
     */
    async buildDev() {
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
            mpaConfig = await this.createMPAConfig();

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
            this.core.internalMiddlewares.push(historyMiddleware({
                htmlAcceptHeaders: ['text/html'],
                disableDotRule: false, // ignore paths with dot inside
                // verbose: true,
                rewrites
            }));
        }

        // add dev & hot-reload middlewares
        this.core.internalMiddlewares.push(this.devMiddleware);
        this.core.internalMiddlewares.push(hotMiddleware);

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

        // use chokidar to rebuild routes
        let pagesDir = join(this.config.globals.rootDir, 'pages');
        this.addWatcher(pagesDir, ['add', 'unlink'], async () => {
            await this.routeManager.buildRoutes();
        });

        // watch files provides by user
        if (this.config.build.watch) {
            this.addWatcher(this.config.build.watch, 'change', async () => {
                await this.rebuild();
            });
        }

        // watch lavas.config.js, rebuild whole process
        let configDir = join(this.config.globals.rootDir, LAVAS_CONFIG_FILE);
        this.addWatcher(configDir, 'change', async () => {
            await this.rebuild();
        });
    }

    /**
     * build in production mode
     */
    async buildProd() {
        this.isProd = true;
        let {build, globals} = this.config;
        // clear dist/ first
        await emptyDir(build.path);
        // inject routes into service-worker.js.tmpl for later use
        await this.injectEntriesToSW();
        await this.routeManager.buildRoutes();
        await this.writeLavasLink();

        // SSR build process
        if (this.ssrExists) {
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
             * TODO: not all the props in config is needed. for now, only manifest
             * & assetsDir are required. some props such as globalDir are useless.
             */
            await this.writeConfigFile(this.config);

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

        // MPA build process
        if (this.mpaExists) {
            console.log('[Lavas] MPA build starting...');
            await webpackCompile(await this.createMPAConfig());
            console.log('[Lavas] MPA build completed.');
        }
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
