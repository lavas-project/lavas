/**
 * @file BaseBuilder
 * @author lavas
 */

import template from 'lodash.template';
import {readFile, pathExists, copySync} from 'fs-extra';
import {join} from 'path';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import SkeletonWebpackPlugin from 'vue-skeleton-webpack-plugin';

import {TEMPLATE_HTML, DEFAULT_ENTRY_NAME, DEFAULT_SKELETON_PATH, CONFIG_FILE} from '../constants';
import {assetsPath} from '../utils/path';
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

    /**
     * write an entry file for a skeleton component
     *
     * @param {string} skeletonPath used as import
     * @return {string} entryPath
     */
    async writeSkeletonEntry(skeletonPath) {
        const skeletonEntryTemplate = this.templatesPath('entry-skeleton.tmpl');
        return await this.writeFileToLavasDir(
            'skeleton.js',
            template(await readFile(skeletonEntryTemplate, 'utf8'))({
                skeleton: {
                    path: skeletonPath
                }
            })
        );
    }

    /**
     * use html webpack plugin
     *
     * @param {Object} spaConfig spaConfig
     * @param {boolean} watcherEnabled enable watcher
     */
    async addHtmlPlugin(spaConfig, watcherEnabled) {
        // allow user to provide a custom HTML template
        let rootDir = this.config.globals.rootDir;
        let htmlFilename = `${DEFAULT_ENTRY_NAME}.html`;
        let customTemplatePath = join(rootDir, `core/${TEMPLATE_HTML}`);

        if (!await pathExists(customTemplatePath)) {
            throw new Error(`${TEMPLATE_HTML} required for entry: ${DEFAULT_ENTRY_NAME}`);
        }

        // write HTML template used by html-webpack-plugin which doesn't support template STRING
        let resolvedTemplatePath = await this.writeFileToLavasDir(
            TEMPLATE_HTML,
            templateUtil.client(await readFile(customTemplatePath, 'utf8'))
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
            chunks: ['manifest', 'vue', 'vendor', DEFAULT_ENTRY_NAME],
            config: this.config // use config in template
        }));

        // watch template in development mode
        if (watcherEnabled) {
            this.addWatcher(customTemplatePath, 'change', async () => {
                await this.writeFileToLavasDir(
                    TEMPLATE_HTML,
                    templateUtil.client(await readFile(customTemplatePath, 'utf8'))
                );
            });
        }
    }

    /**
     * create a webpack config which will be compiled later
     *
     * @param {boolean} watcherEnabled enable watcher
     * @return {Object} spaConfig webpack config for SPA
     */
    async createSPAConfig(watcherEnabled) {
        let {globals, build, router} = this.config;
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
        if (!build.ssr) {
            // set client entry first
            spaConfig.entry[DEFAULT_ENTRY_NAME] = [`./core/entry-client.js`];

            // add html-webpack-plugin
            await this.addHtmlPlugin(spaConfig, watcherEnabled);

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
        }

        return spaConfig;
    }
}
