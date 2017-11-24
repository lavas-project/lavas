/**
 * @file ssr renderer
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import {join} from 'path';
import {pathExists, readFile, readJson, outputFile} from 'fs-extra';
import {createBundleRenderer} from 'vue-server-renderer';
import VueSSRClientPlugin from './plugins/ssr-client-plugin';

import {distLavasPath} from './utils/path';
import {webpackCompile, enableHotReload} from './utils/webpack';
import templateUtil from './utils/template';

import {LAVAS_DIRNAME_IN_DIST, TEMPLATE_HTML, SERVER_BUNDLE, CLIENT_MANIFEST} from './constants';

export default class Renderer {
    constructor(core) {
        this.isProd = core.isProd;
        this.config = core.config;
        this.rootDir = this.config && this.config.globals.rootDir;
        this.cwd = core.cwd;
        this.renderer = {};
        this.serverBundle = null;
        this.clientManifest = {};
        this.templates = {};
        this.resolve = null;
        this.readyPromise = new Promise(r => this.resolve = r);
        this.entries = this.config.entry.map(e => e.name);
    }

    /**
     * get template path for entry
     *
     * @param {string} entryName entry name
     * @return {string} template path
     */
    getTemplatePathByEntry(entryName) {
        let templateName = this.getTemplateName(entryName);
        return join(this.rootDir, `entries/${entryName}/${templateName}`);
    }

    /**
     * return ssr template
     *
     * @param {string} entryName entry name
     * @param {string} baseUrl entry base url
     * @return {string} templateContent
     */
    async getTemplate(entryName, baseUrl = '/') {
        let templatePath = this.getTemplatePathByEntry(entryName);
        if (!await pathExists(templatePath)) {
            throw new Error(`${templatePath} required for entry: ${entryName}`);
        }
        return templateUtil.server(
            await readFile(templatePath, 'utf8'),
            baseUrl
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
        return TEMPLATE_HTML;
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

    /**
     * create renderer with built serverBundle & clientManifest in production mode
     */
    async createWithBundle() {
        this.serverBundle = await readJson(distLavasPath(this.cwd, SERVER_BUNDLE));

        await Promise.all(this.config.entry.map(async entry => {
            let {name: entryName, ssr} = entry;
            let templatePath = distLavasPath(this.cwd, `${entryName}/${this.getTemplateName(entryName)}`);
            let manifestPath = distLavasPath(this.cwd, `${entryName}/${CLIENT_MANIFEST}`);
            if (ssr) {
                this.templates[entryName] = await readFile(templatePath, 'utf-8');
                this.clientManifest[entryName] = await readJson(manifestPath);
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
                let {name: entryName, base: baseUrl} = entryConfig;
                let templateContent = await this.getTemplate(entryName, baseUrl);
                let distTemplatePath = distLavasPath(
                    this.config.build.path,
                    `${entryName}/${this.getTemplateName(entryName)}`
                );
                await outputFile(distTemplatePath, templateContent);
            }
        }));
    }

    async buildDev() {
        let lavasDir = join(this.rootDir, './.lavas');

        // add watcher for each template
        this.entries.map(entryName => {
            let templatePath = this.getTemplatePathByEntry(entryName);
            this.addWatcher(templatePath, 'change', async () => {
                await this.refreshFiles(true);
            });
        });

        await enableHotReload(lavasDir, this.clientConfig, true);

        // add custom ssr client plugin
        this.addSSRClientPlugin();
    }

    /**
     * if any of clientManifest, serverBundle and template changed, refresh them and
     * create new renderer
     */
    async refreshFiles() {
        console.log('[Lavas] refresh ssr bundle & manifest.');

        let changed = false;
        let templateChanged = false;
        this.clientManifest = this.entries.reduce((prev, entryName) => {
            let clientManifestPath = distLavasPath(this.clientConfig.output.path, `${entryName}/${CLIENT_MANIFEST}`);
            if (this.clientMFS.existsSync(clientManifestPath)) {
                let clientManifestContent = this.clientMFS.readFileSync(clientManifestPath, 'utf-8');
                if (prev[entryName] && JSON.stringify(prev[entryName]) !== clientManifestContent) {
                    changed = true;
                }
                prev[entryName] = JSON.parse(clientManifestContent);
            }
            return prev;
        }, {});

        let serverBundlePath = distLavasPath(this.serverConfig.output.path, SERVER_BUNDLE);
        if (this.serverMFS.existsSync(serverBundlePath)) {
            let serverBundleContent = this.serverMFS.readFileSync(serverBundlePath, 'utf8');
            if (this.serverBundle && JSON.stringify(this.serverBundle) !== serverBundleContent) {
                changed = true;
            }
            this.serverBundle = JSON.parse(serverBundleContent);
        }

        this.templates = {};
        await Promise.all(this.config.entry.map(async entryConfig => {
            let {name: entryName, base: baseUrl} = entryConfig;
            let templateContent = await this.getTemplate(entryName, baseUrl);
            if (this.templates[entryName] !== templateContent) {
                changed = true;
                templateChanged = true;
            }
            this.templates[entryName] = templateContent;
        }));

        if (changed) {
            await this.createRenderer();

            // if we detect template changed, publish reload event to client
            if (templateChanged) {
                this.reloadClient();
            }
        }
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
        this.clientConfig.name = 'ssrclient';
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
        if (this.serverBundle && Object.keys(this.clientManifest).length) {
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
     * @param {string} entryName entryName
     * @return {Promise.<*>}
     */
    getRenderer(entryName) {
        if (this.renderer[entryName]) {
            return Promise.resolve(this.renderer[entryName]);
        }

        return this.readyPromise;
    }
}
