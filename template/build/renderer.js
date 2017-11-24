/**
 * @file ssr renderer
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import {join} from 'path';
import fs from 'fs-extra';
import webpack from 'webpack';
import MFS from 'memory-fs';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import {createBundleRenderer} from 'vue-server-renderer';
import VueSSRClientPlugin from './plugins/ssr-client-plugin';

import {distLavasPath, resolveAliasPath} from './utils/path';
import {webpackCompile, enableHotReload} from './utils/webpack';
import templateUtil from './utils/template';

import {LAVAS_DIRNAME_IN_DIST, TEMPLATE_HTML, SERVER_BUNDLE, CLIENT_MANIFEST} from './constants';

export default class Renderer {
    constructor(core) {
        this.isProd = core.isProd;
        this.config = core.config;
        this.rootDir = this.config && this.config.globals.rootDir;
        this.cwd = core.cwd;
        this.internalMiddlewares = core.internalMiddlewares;
        this.renderer = {};
        this.serverBundle = null;
        this.clientManifest = {};
        this.templates = {};
        this.resolve = null;
        this.readyPromise = new Promise(r => this.resolve = r);
        this.entries = this.config.entry.map(e => e.name);
    }

    /**
     * return ssr template
     *
     * @param {string} alias webpack alias
     * @param {string} entryName entry name
     * @return {string} resolved path
     */
    getTemplate(entryName) {
        let templateName = this.getTemplateName(entryName);
        let templatePath = join(this.rootDir, `entries/${entryName}/${templateName}`);
        if (!fs.pathExistsSync(templatePath)) {
            throw new Error(`${templateName} required for entry: ${entryName}`);
        }
        return templateUtil.server(
            fs.readFileSync(templatePath, 'utf8')
        );
    }

    /**
     * get template name from entry config
     *
     * @param {string} entryName entryName
     * @return {string} template name
     */
    getTemplateName(entryName) {
        let entryConfig = this.config.entry.find(entry => entry.name === entryName);
        if (entryConfig && entryConfig.templateFile) {
            return entryConfig.templateFile;
        }
        else {
            return TEMPLATE_HTML;
        }
    }

    /**
     * add custom ssr client plugin in config
     */
    addSSRClientPlugin() {
        this.clientConfig.plugins.push(
            new VueSSRClientPlugin({
                filename: join(LAVAS_DIRNAME_IN_DIST, `[entryName]/${CLIENT_MANIFEST}`)
            })
        );
    }

    async createWithBundle() {
        this.serverBundle = await fs.readFile(distLavasPath(this.cwd, SERVER_BUNDLE));

        await Promise.all(this.config.entry.map(async entry => {
            let {name: entryName, ssr} = entry;
            let templatePath = distLavasPath(this.cwd, `${entryName}/${this.getTemplateName(entryName)}`);
            let manifestPath = distLavasPath(this.cwd, `${entryName}/${CLIENT_MANIFEST}`);
            if (ssr) {
                this.templates[entryName] = await fs.readFile(templatePath, 'utf-8');
                this.clientManifest[entryName] = await fs.readFile(manifestPath);
            }
        }));

        await this.createRenderer();
    }

    async buildProd() {
        this.addSSRClientPlugin();

        // start to build client & server configs
        await webpackCompile([this.clientConfig, this.serverConfig]);

        // copy index.template.html to dist/lavas/{entryName}/
        await Promise.all(this.config.entry.map(async entryConfig => {
            if (entryConfig.ssr) {
                let entryName = entryConfig.name;
                let templateContent = this.getTemplate(entryName);
                let distTemplatePath = distLavasPath(
                    this.config.webpack.base.output.path,
                    `${entryName}/${this.getTemplateName(entryName)}`
                );
                await fs.outputFile(distTemplatePath, templateContent);
            }
        }));
    }

    async buildDev() {
        await Promise.all(this.entries.map(async entryName => {
            this.templates[entryName] = this.getTemplate(entryName);
        }));

        enableHotReload(this.clientConfig);

        // add custom ssr client plugin
        this.addSSRClientPlugin();

        let clientCompiler = webpack(this.clientConfig);

        // dev middleware
        let devMiddleware = webpackDevMiddleware(clientCompiler, {
            publicPath: this.config.webpack.base.output.publicPath,
            noInfo: true
        });
        this.devFs = devMiddleware.fileSystem;
        clientCompiler.outputFileSystem = this.devFs;

        this.internalMiddlewares.push(devMiddleware);

        // hot middleware
        let hotMiddleware = webpackHotMiddleware(clientCompiler, {
            heartbeat: 5000
        });

        this.internalMiddlewares.push(hotMiddleware);

        clientCompiler.plugin('done', async stats => {
            stats = stats.toJson();
            stats.errors.forEach(err => console.error(err));
            stats.warnings.forEach(err => console.warn(err));

            if (stats.errors.length) {
                for (let error of stats.errors) {
                    console.error(error);
                }
                return;
            }
            await this.refreshFiles();
        });

        let serverCompiler = webpack(this.serverConfig);
        this.mfs = new MFS();
        serverCompiler.outputFileSystem = this.mfs;

        serverCompiler.watch({}, async (err, stats) => {
            if (err) {
                throw err;
            }
            stats = stats.toJson();
            if (stats.errors.length) {
                // print all errors
                for (let error of stats.errors) {
                    console.error(error);
                }
                return;
            }
            await this.refreshFiles();
        });
    }

    async refreshFiles() {
        let changed = false;
        console.log('[Lavas] refresh ssr bundle & manifest.');
        this.clientManifest = this.entries.reduce((prev, entryName) => {
            let clientManifestPath = distLavasPath(this.clientConfig.output.path, `${entryName}/${CLIENT_MANIFEST}`);
            if (this.devFs.existsSync(clientManifestPath)) {
                let clientManifestContent = this.devFs.readFileSync(clientManifestPath, 'utf-8');
                // if (prev[entryName] && prev[entryName] !== clientManifestContent) {
                    prev[entryName] = JSON.parse(clientManifestContent);
                //     changed = true;
                // }
            }
            return prev;
        }, {});

        let serverBundlePath = distLavasPath(this.serverConfig.output.path, SERVER_BUNDLE);
        if (this.mfs.existsSync(serverBundlePath)) {
            let serverBundleContent = this.mfs.readFileSync(serverBundlePath, 'utf8');
            // if (this.serverBundle !== serverBundleContent) {
                this.serverBundle = JSON.parse(serverBundleContent);
                // changed = true;
            // }
        }

        // if (changed) {
        await this.createRenderer();
        // }
    }

    async build(clientConfig, serverConfig) {
        this.clientConfig = clientConfig;
        this.serverConfig = serverConfig;

        // set entries in both client & server webpack config
        this.setWebpackEntries();

        if (this.isProd) {
            await this.buildProd();
        }
        else {
            await this.buildDev();
        }
    }

    /**
     * set entries in both client & server webpack config
     */
    setWebpackEntries() {
        // set context in both configs first
        this.clientConfig.context = this.rootDir;
        this.serverConfig.context = this.rootDir;

        // each entry should have an independent client entry
        this.clientConfig.entry = {};
        this.clientConfig.name = 'client';
        this.config.entry.forEach(entryConfig => {
            if (!this.isProd || (this.isProd && entryConfig.ssr)) {
                let entryName = entryConfig.name;
                this.clientConfig.entry[entryName] = [`./entries/${entryName}/entry-client.js`];
            }
        });

        // only one entry in server side
        this.serverConfig.entry = './core/entry-server.js';
    }

    /**
     * create renderer
     */
    async createRenderer() {
        if (this.serverBundle && this.clientManifest) {
            await Promise.all(this.entries.map(async entryName => {
                if (this.clientManifest[entryName]) {
                    let first = !this.renderer[entryName];
                    this.renderer[entryName] = createBundleRenderer(
                        this.serverBundle,
                        {
                            template: this.templates[entryName],
                            clientManifest: this.clientManifest[entryName],
                            runInNewContext: false,
                            inject: false
                        }
                    );
                    if (first) {
                        this.resolve(this.renderer[entryName]);
                    }
                }
            }));
        }
    }

    /**
     * get vue server renderer
     *
     * @return {Promise.<*>}
     */
    getRenderer(entryName) {
        if (this.renderer[entryName]) {
            return Promise.resolve(this.renderer[entryName]);
        }

        return this.readyPromise;
    }
}
