/**
 * @file BaseBuilder
 * @author lavas
 */

import template from 'lodash.template';
import {readFile, pathExists} from 'fs-extra';
import {join, basename, normalize} from 'path';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import SkeletonWebpackPlugin from 'vue-skeleton-webpack-plugin';
import VueSSRClientPlugin from 'vue-server-renderer/client-plugin';

import {TEMPLATE_HTML, SPA_TEMPLATE_HTML, DEFAULT_ENTRY_NAME, DEFAULT_SKELETON_PATH,
    CONFIG_FILE, LAVAS_DIRNAME_IN_DIST, CLIENT_MANIFEST, STORE_FILE} from '../constants';
import {assetsPath, resolveAliasPath, camelCaseToDash} from '../utils/path';
import {enableHotReload} from '../utils/webpack';
import * as JsonUtil from '../utils/json';
import templateUtil from '../utils/template';

import RouteManager from '../route-manager';
import WebpackConfig from '../webpack';
import {RUMTIME_ITEMS} from '../config-reader';

export default class BaseBuilder {
    constructor(core) {
        this.core = core;
        this.env = core.env;
        this.cwd = core.cwd;
        this.renderer = core.renderer;
        this.webpackConfig = new WebpackConfig(core.config, this.env);
        this.routeManager = new RouteManager(core.config, this.env);

        // will be overrided by subclass
        this.writeFile = null;

        this.init(core.config);
    }

    /**
     * do some initialization stuffs,
     * will be called later by rebuild in dev mode
     *
     * @param {Object} config config
     */
    init(config) {
        this.processConfig(config);
        this.config = config;
        this.webpackConfig.config = config;
        this.routeManager.config = config;
    }

    /**
     * process config
     *
     * @override
     */
    processConfig() {}

    /**
     * build
     *
     * @override
     */
    build() {
        throw new Error('[Lavas] Builder.build() must be overrided.');
    }

    /**
     * close
     *
     * @override
     */
    close() {}

    /**
     * resolve path relative to ./templates
     *
     * @param {string} path relative path of file
     * @return {string} resolvedPath absolute path of file
     */
    templatesPath(path = '/') {
        return join(__dirname, '../templates', path);
    }

    /**
     * resolve path relative to ./.lavas
     *
     * @param {string} path relative path of file
     * @return {string} resolvedPath absolute path of file
     */
    lavasPath(path = '/') {
        return join(this.config.globals.rootDir, './.lavas', path);
    }

    /**
     * write file to /.lavas directory
     *
     * @param {string} path relative path of file
     * @param {string} content content of file
     * @return {string} resolvedPath absolute path of file
     */
    async writeFileToLavasDir(path, content) {
        let resolvedPath = this.lavasPath(path);
        await this.writeFile(resolvedPath, content);
        return resolvedPath;
    }

    /**
     * write config used in runtime
     */
    async writeRuntimeConfig() {
        let filteredConfig = JsonUtil.deepPick(this.config, RUMTIME_ITEMS);
        await this.writeFileToLavasDir(CONFIG_FILE, JsonUtil.stringify(filteredConfig, null, 4));
    }

    async writeMiddleware() {
        const middlewareTemplate = this.templatesPath('middleware.tmpl');
        let isEmpty = !(await pathExists(join(this.config.globals.rootDir, 'middlewares')));

        await this.writeFileToLavasDir(
            'middleware.js',
            template(await readFile(middlewareTemplate, 'utf8'))({
                isEmpty
            })
        );
    }

    async writeStore() {
        const storeTemplate = this.templatesPath('store.tmpl');
        let isEmpty = !(await pathExists(join(this.config.globals.rootDir, 'store')));

        await this.writeFileToLavasDir(
            STORE_FILE,
            template(await readFile(storeTemplate, 'utf8'))({
                isEmpty
            })
        );
    }

    async writeLavasLink() {
        let lavasLinkTemplate = await readFile(this.templatesPath('LavasLink.js.tmpl'), 'utf8');
        await this.writeFileToLavasDir('LavasLink.js', template(lavasLinkTemplate)({
            entryConfig: JsonUtil.stringify(this.config.entries.map(entry => {
                // only select necessary keys
                return {
                    name: entry.name,
                    urlReg: entry.urlReg
                };
            })),
            base: this.config.router.base,
            mode: this.config.router.mode
        }));
    }

    /**
     * write an entry file for skeleton components
     *
     * @param {Array} skeletons routes for skeletons
     * @return {string} entryPath
     */
    async writeSkeletonEntry(skeletons) {
        const skeletonEntryTemplate = this.templatesPath('entry-skeleton.tmpl');

        return await this.writeFileToLavasDir(
            'skeleton.js',
            template(await readFile(skeletonEntryTemplate, 'utf8'))({skeletons})
        );
    }

    /**
     * use html webpack plugin
     *
     * @param {Object} spaConfig spaConfig
     * @param {string} baseUrl baseUrl from config/router
     * @return {string} resolvedTemplatePath html template's path
     */
    async addHtmlPlugin(spaConfig, baseUrl = '/') {
        // allow user to provide a custom HTML template
        let rootDir = this.config.globals.rootDir;
        let htmlFilename;
        let templatePath;
        let tempTemplatePath;

        htmlFilename = `${DEFAULT_ENTRY_NAME}.html`;

        // find core/spa.html.tmpl
        templatePath = join(rootDir, `core/${SPA_TEMPLATE_HTML}`);
        if (!await pathExists(templatePath)) {
            // find core/index.html.tmpl
            templatePath = join(rootDir, `core/${TEMPLATE_HTML}`);
        }

        if (!await pathExists(templatePath)) {
            throw new Error(`${SPA_TEMPLATE_HTML} or ${TEMPLATE_HTML} required`);
        }

        tempTemplatePath = basename(templatePath);

        // write HTML template used by html-webpack-plugin which doesn't support template STRING
        let resolvedTemplatePath = await this.writeFileToLavasDir(
            tempTemplatePath,
            templateUtil.client(await readFile(templatePath, 'utf8'), baseUrl)
        );

        // add html webpack plugin
        spaConfig.plugin('html').use(HtmlWebpackPlugin, [{
            filename: htmlFilename,
            template: resolvedTemplatePath,
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            },
            favicon: assetsPath('img/icons/favicon.ico'),
            chunksSortMode: 'dependency',
            cache: false,
            chunks: ['manifest', 'vue', 'vendor', DEFAULT_ENTRY_NAME],
            config: this.config // use config in template
        }]);

        return {resolvedTemplatePath, tempTemplatePath};
    }

    /**
     * use vue-skeleton-webpack-plugin
     *
     * @param {Object} spaConfig spaConfig
     */
    async addSkeletonPlugin(spaConfig) {
        let {router, skeleton} = this.config;
        // if skeleton provided, we need to create an entry
        let skeletonConfig;

        // add default skeleton path `@/core/Skeleton.vue`
        if (!skeleton.routes || !skeleton.routes.length) {
            skeleton.routes = [{
                path: '*',
                componentPath: DEFAULT_SKELETON_PATH
            }];
        }

        // check if all the componentPaths are existed first
        let error = await this.validateSkeletonRoutes(skeleton.routes, spaConfig.resolve.alias.entries());
        if (error && error.msg) {
            console.error(error.msg);
        }
        else {
            // generate skeletonId based on componentPath
            skeleton.routes.forEach(route => {
                route.componentName = basename(route.componentPath, '.vue');
                route.componentNameInDash = camelCaseToDash(route.componentName);
                route.skeletonId = route.skeletonId || route.componentNameInDash;
            });

            // marked as supported at this time
            this.skeletonEnabled = true;

            let skeletonEntryPath = await this.writeSkeletonEntry(skeleton.routes);

            // when ssr skeleton, we need to extract css from js
            skeletonConfig = await this.webpackConfig.server({
                cssExtract: true,
                extendWithWebpackChain: (serverConfig, {type}) => {
                    if (type === 'server') {
                        serverConfig.entry(DEFAULT_ENTRY_NAME).add(skeletonEntryPath);
                        // remove some plugins
                        serverConfig.plugins
                            .delete('ssr-server')
                            .delete('progress-bar')
                            .delete('progress')
                            .delete('friendly-error');
                    }
                }
            });

            // add skeleton plugin
            spaConfig.plugin('skeleton').use(SkeletonWebpackPlugin, [{
                webpackConfig: skeletonConfig,
                quiet: true,
                router: {
                    mode: router.mode,
                    routes: skeleton.routes
                },
                minimize: !this.isDev
            }]);
        }
    }

    /**
     * validate skeleton.router.routes
     *
     * @param {Array} routes routes for skeleton
     * @param {Object} alias alias in webpack
     * @return {boolean|Object} error error
     */
    async validateSkeletonRoutes(routes, alias) {
        let currentRoute;
        let resolvedPaths = [];
        let isComponentPathResolved;
        for (let i = 0; i < routes.length; i++) {
            currentRoute = routes[i];

            if (!currentRoute.componentPath) {
                return {
                    msg: `[Lavas] componentPath for ${currentRoute.path} is required.`
                };
            }

            // try to resolve componentPath with rootDir and webpack alias
            isComponentPathResolved = false;
            resolvedPaths = [
                join(this.config.globals.rootDir, currentRoute.componentPath),
                resolveAliasPath(alias, currentRoute.componentPath)
            ];
            for (let j = 0; j < resolvedPaths.length; j++) {
                if (await pathExists(resolvedPaths[j])) {
                    // in Windows, normalize will replace posix.sep`/` with win32.sep`\\`
                    currentRoute.componentPath = normalize(resolvedPaths[j])
                        .replace(/\\/g, '\\\\'); // escape backslash before writing to skeleton template
                    isComponentPathResolved = true;
                    break;
                }
            }

            if (!isComponentPathResolved) {
                return {
                    msg: `[Lavas] ${currentRoute.componentPath} is not existed during the process of generating skeleton.`
                };
            }
        }
        return false;
    }

    /**
     * create a webpack config which will be compiled later
     *
     * @return {Object} spaConfig webpack config for SPA
     */
    async createSPAConfig() {
        let {globals, router, skeleton} = this.config;
        let rootDir = globals.rootDir;

        // create spa config based on client config
        return await this.webpackConfig.client({
            extendWithWebpackChain: async (clientConfig, {type}) => {
                if (type === 'client') {
                    clientConfig.name = 'spaclient';
                    clientConfig
                        .context(rootDir)
                        .entry(DEFAULT_ENTRY_NAME).add('./core/entry-client.js');

                    // add html-webpack-plugin
                    let {
                        resolvedTemplatePath: customTemplatePath,
                        tempTemplatePath
                    } = await this.addHtmlPlugin(clientConfig, router.base);
                    // let customTemplatePath = await this.addHtmlPlugin(clientConfig, router.base);

                    // add vue-skeleton-webpack-plugin
                    if (skeleton && skeleton.enable) {
                        await this.addSkeletonPlugin(clientConfig);
                    }

                    // watch template in development mode
                    if (this.isDev) {
                        // watch html
                        this.addWatcher(customTemplatePath, 'change', async () => {
                            await this.writeFileToLavasDir(
                                tempTemplatePath,
                                templateUtil.client(await readFile(customTemplatePath, 'utf8'), router.base)
                            );
                        });

                        // enable hotreload in every entry in dev mode
                        await enableHotReload(this.lavasPath(), clientConfig, true);

                        // add skeleton routes
                        if (this.skeletonEnabled) {
                            // TODO: handle skeleton routes in dev mode
                            // this.addSkeletonRoutes(spaConfig);
                        }
                    }
                }
            }
        });
    }

    /**
     * create a webpack config which will be compiled later
     *
     * @param {boolean} isDev enable watcher
     * @return {Object} SSRClientConfig webpack config for SSRClient
     */
    async createSSRClientConfig() {
        return await this.webpackConfig.client({
            extendWithWebpackChain: async (clientConfig, {type}) => {
                if (type === 'client') {
                    clientConfig.name = 'ssrclient';
                    clientConfig
                        .context(this.config.globals.rootDir)
                        .entry(DEFAULT_ENTRY_NAME).add('./core/entry-client.js');

                    // add vue-ssr-client-plugin
                    clientConfig.plugin('ssr-client')
                        .use(VueSSRClientPlugin, [{
                            filename: join(LAVAS_DIRNAME_IN_DIST, CLIENT_MANIFEST)
                        }]);

                    if (this.isDev) {
                        // enable hot-reload
                        await enableHotReload(this.lavasPath(), clientConfig, true);
                    }
                }
            }
        });
    }

    /**
     * create a webpack config which will be compiled later
     *
     * @return {Object} SSRServerConfig webpack config for SSRServer
     */
    async createSSRServerConfig() {
        return await this.webpackConfig.server({
            extendWithWebpackChain: async (serverConfig, {type}) => {
                if (type === 'server') {
                    serverConfig.name = 'ssrserver';
                    serverConfig
                        .context(this.config.globals.rootDir)
                        .entry(DEFAULT_ENTRY_NAME).add('./core/entry-server.js');
                }
            }
        });
    }
}
