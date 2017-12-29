/**
 * @file BaseBuilder
 * @author lavas
 */

import template from 'lodash.template';
import {readFile, pathExists, copySync} from 'fs-extra';
import {join} from 'path';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import SkeletonWebpackPlugin from 'vue-skeleton-webpack-plugin';

import {TEMPLATE_HTML, DEFAULT_ENTRY_NAME} from '../constants';
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
        this.config = config;
        this.webpackConfig.config = config;
        this.routeManager.config = config;
        this.ssr = config.build.ssr;
    }

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
        await this.writeFileToLavasDir('config.json', JsonUtil.stringify(filteredConfig, null, 4));
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
     * @param {Object} mpaConfig mpaConfig
     * @param {string} entryName entryName
     * @param {string} baseUrl entry base url
     * @param {boolean} watcherEnabled enable watcher
     */
    async addHtmlPlugin(mpaConfig, entryName, baseUrl, watcherEnabled) {
        // allow user to provide a custom HTML template
        let rootDir = this.config.globals.rootDir;
        let htmlFilename = `${entryName}.html`;
        let customTemplatePath = join(rootDir, `core/${TEMPLATE_HTML}`);

        if (!await pathExists(customTemplatePath)) {
            throw new Error(`${TEMPLATE_HTML} required for entry: ${entryName}`);
        }

        let entryTemplatePath = join(entryName, TEMPLATE_HTML);
        let resolvedTemplatePath = await this.writeFileToLavasDir(
            entryTemplatePath,
            templateUtil.client(await readFile(customTemplatePath, 'utf8'), baseUrl)
        );

        // add html webpack plugin
        mpaConfig.plugins.unshift(new HtmlWebpackPlugin({
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
            chunks: ['manifest', 'vue', 'vendor', entryName],
            config: this.config // use config in template
        }));

        // watch template in development mode
        if (watcherEnabled) {
            this.addWatcher(customTemplatePath, 'change', async () => {
                await this.writeFileToLavasDir(
                    entryTemplatePath,
                    templateUtil.client(await readFile(customTemplatePath, 'utf8'), baseUrl)
                );
            });
        }
    }

    /**
     * create a webpack config which will be compiled later
     *
     * @param {boolean} watcherEnabled enable watcher
     * @return {Object} mpaConfig webpack config for MPA
     */
    async createMPAConfig(watcherEnabled) {
        let {globals, build, router} = this.config;
        let entryName = DEFAULT_ENTRY_NAME;
        let rootDir = globals.rootDir;

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
        if (!build.ssr) {
            // set client entry first
            mpaConfig.entry[entryName] = [`./core/entry-client.js`];

            // add html-webpack-plugin
            await this.addHtmlPlugin(mpaConfig, entryName, router.baseUrl, watcherEnabled);

            // if skeleton provided, we need to create an entry
            let skeletonPath = join(rootDir, `core/Skeleton.vue`);
            let skeletonImportPath = `@/core/Skeleton.vue`;
            if (await pathExists(skeletonPath)) {
                let entryPath = await this.writeSkeletonEntry(skeletonImportPath);
                skeletonEntries[entryName] = [entryPath];
            }
        }

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

        return mpaConfig;
    }
}
