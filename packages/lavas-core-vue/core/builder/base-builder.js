/**
 * @file BaseBuilder
 * @author lavas
 */

import template from 'lodash.template';
import {readFile, pathExists, copySync} from 'fs-extra';
import {join, basename, normalize} from 'path';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import SkeletonWebpackPlugin from 'vue-skeleton-webpack-plugin';

import {TEMPLATE_HTML, DEFAULT_ENTRY_NAME, DEFAULT_SKELETON_PATH, CONFIG_FILE, STORE_FILE} from '../constants';
import {assetsPath, resolveAliasPath, camelCaseToDash} from '../utils/path';
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
     * @param {Array} skeleton routes
     * @return {string} entryPath
     */
    async writeSkeletonEntry(skeletons) {
        const skeletonEntryTemplate = this.templatesPath('entry-skeleton.tmpl');

        return await this.writeFileToLavasDir(
            'skeleton.js',
            template(await readFile(skeletonEntryTemplate, 'utf8'))({skeletons})
        );
    }

    getTemplatePath(entryName) {
        let templatePath = this.config.templatePath;
        let rootDir = this.config.globals.rootDir;

        return templatePath
            ? join(rootDir, templatePath.replace(/\[entryName\]/g, entryName))
            : join(rootDir, `core/${TEMPLATE_HTML}`);
    }

    /**
     * use html webpack plugin
     *
     * @param {Object} spaConfig spaConfig
     * @param {string} baseUrl baseUrl from config/router
     * @param {boolean} watcherEnabled enable watcher
     * @param {?string} entryName entry name in MPA, undefined in SPA
     */
    async addHtmlPlugin(spaConfig, baseUrl = '/', watcherEnabled, entryName) {
        let rootDir = this.config.globals.rootDir;
        let htmlFilename;
        let templatePath;
        let tempTemplatePath;
        if (entryName) {
            htmlFilename = `${entryName}/${entryName}.html`;
            templatePath = this.getTemplatePath(entryName);
            tempTemplatePath = `${entryName}/${TEMPLATE_HTML}`;
        }
        else {
            htmlFilename = `${DEFAULT_ENTRY_NAME}.html`;
            templatePath = this.getTemplatePath();
            tempTemplatePath = TEMPLATE_HTML;
        }

        if (!await pathExists(templatePath)) {
            throw new Error(`${TEMPLATE_HTML} required for entry: ${entryName || DEFAULT_ENTRY_NAME}`);
        }

        // fetch templateObject from entries/[entryName]/config.js
        let templateObject = entryName
            ? this.config.entries.find(entry => entry.name === entryName).templateObject
            : {};

        // write HTML template used by html-webpack-plugin which doesn't support template STRING
        let resolvedTemplatePath = await this.writeFileToLavasDir(
            tempTemplatePath,
            templateUtil.client(await readFile(templatePath, 'utf8'), baseUrl, templateObject)
        );

        // add html webpack plugin
        spaConfig.plugins.unshift(new HtmlWebpackPlugin({
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
            chunks: ['manifest', 'vue', 'vendor', entryName || DEFAULT_ENTRY_NAME],
            config: this.config // use config in template
        }));

        // watch template in development mode
        if (watcherEnabled) {
            this.addWatcher(templatePath, 'change', async () => {
                await this.writeFileToLavasDir(
                    tempTemplatePath,
                    templateUtil.client(await readFile(templatePath, 'utf8'), baseUrl, templateObject)
                );
            });
        }
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
        let skeletonEntries = {};

        // add default skeleton path `@/core/Skeleton.vue`
        if (!skeleton.routes || !skeleton.routes.length) {
            skeleton.routes = [{
                path: '*',
                componentPath: DEFAULT_SKELETON_PATH
            }];
        }

        // check if all the componentPaths are existed first
        let error = await this.validateSkeletonRoutes(skeleton.routes, spaConfig.resolve.alias);
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

            skeletonEntries[DEFAULT_ENTRY_NAME] = [await this.writeSkeletonEntry(skeleton.routes)];

            // when ssr skeleton, we need to extract css from js
            skeletonConfig = this.webpackConfig.server({cssExtract: true});
            // TODO: remove vue-ssr-client plugin
            skeletonConfig.plugins.pop();
            skeletonConfig.entry = skeletonEntries;

            // add skeleton plugin
            spaConfig.plugins.push(new SkeletonWebpackPlugin({
                webpackConfig: skeletonConfig,
                quiet: true,
                router: {
                    mode: router.mode,
                    routes: skeleton.routes
                },
                minimize: !this.isDev
            }));
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
            ]
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
     * @param {boolean} watcherEnabled enable watcher
     * @return {Object} spaConfig webpack config for SPA
     */
    async createSPAConfig(watcherEnabled) {
        let {globals, build, router, skeleton, entries} = this.config;
        let rootDir = globals.rootDir;

        // create spa config based on client config
        let spaConfig = this.webpackConfig.client();

        // set context and clear entries
        spaConfig.entry = {};
        spaConfig.name = 'spaclient';
        spaConfig.context = rootDir;

        /**
         * for SPA, we will:
         * 1. add a html-webpack-plugin to output a HTML file
         * 2. create an entry if a skeleton component is provided
         */
        if (entries.length === 0) {
            // set client entry first
            spaConfig.entry[DEFAULT_ENTRY_NAME] = ['./core/entry-client.js'];

            // add html-webpack-plugin
            await this.addHtmlPlugin(spaConfig, router.base, watcherEnabled);

            // add vue-skeleton-webpack-plugin
            if (skeleton && skeleton.enable) {
                await this.addSkeletonPlugin(spaConfig);
            }
        }
        else {
            await Promise.all(entries.map(async entry => {
                let entryName = entry.name;
                // set client entry first
                spaConfig.entry[entryName] = [`./entries/${entryName}/entry-client.js`];

                // add html-webpack-plugin
                await this.addHtmlPlugin(spaConfig, router.base, watcherEnabled, entryName);

                // if skeleton provided, we need to create an entry
                if (build.skeleton && build.skeleton.enable) {
                    let skeletonConfig;
                    let skeletonEntries = {};
                    let skeletonPath;
                    let skeletonImportPath;
                    let skeletonRelativePath = build.skeleton.path || DEFAULT_SKELETON_PATH;

                    skeletonPath = join(rootDir, skeletonRelativePath);
                    skeletonImportPath = `@/${skeletonRelativePath}`;

                    if (await pathExists(skeletonPath)) {

                        // marked as supported at this time
                        this.skeletonEnabled = true;

                        skeletonEntries[DEFAULT_ENTRY_NAME] = [await this.writeSkeletonEntry(skeletonImportPath)];

                        // when ssr skeleton, we need to extract css from js
                        skeletonConfig = this.webpackConfig.server({cssExtract: true});
                        // remove vue-ssr-client plugin
                        skeletonConfig.plugins.pop();
                        skeletonConfig.entry = skeletonEntries;

                        // add skeleton plugin
                        spaConfig.plugins.push(new SkeletonWebpackPlugin({
                            webpackConfig: skeletonConfig
                        }));
                    }
                }
            }));
        }

        return spaConfig;
    }
}
