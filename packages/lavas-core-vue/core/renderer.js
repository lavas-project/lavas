/**
 * @file ssr renderer
 * @author *__ author __*{% if: *__ email __* %}(*__ email __*){% /if %}
 */

import {join} from 'path';
import {pathExists, readFile, readJson, outputFile} from 'fs-extra';
import {merge} from 'lodash';
import {createBundleRenderer} from 'vue-server-renderer';
import VueSSRClientPlugin from 'vue-server-renderer/client-plugin';

import {DEFAULT_ENTRY_NAME} from './constants';
import {distLavasPath} from './utils/path';
import {webpackCompile, enableHotReload} from './utils/webpack';
import templateUtil from './utils/template';

import {LAVAS_DIRNAME_IN_DIST, TEMPLATE_HTML, SERVER_BUNDLE, CLIENT_MANIFEST} from './constants';

export default class Renderer {
    constructor(core) {
        this.isProd = core.isProd;
        this.config = core.config;
        this.rootDir = this.config.globals
            && this.config.globals.rootDir;
        this.cwd = core.cwd;
        this.renderer = null;
        this.serverBundle = null;
        this.clientManifest = null;
        this.template = null;
        this.resolve = null;
        this.readyPromise = new Promise(r => this.resolve = r);
    }

    /**
     * get template path
     *
     * @return {string} template path
     */
    getTemplatePath() {
        return join(this.rootDir, `core/${this.getTemplateName()}`);
    }

    /**
     * get template name
     *
     * @return {string} template path
     */
    getTemplateName() {
        return this.config.router.templateFile || TEMPLATE_HTML;
    }

    /**
     * return ssr template
     *
     * @param {string} base base url
     * @return {string} templateContent
     */
    async getTemplate(base = '/') {
        let templatePath = this.getTemplatePath();
        if (!await pathExists(templatePath)) {
            throw new Error(`${templatePath} required`);
        }

        return templateUtil.server(
            await readFile(templatePath, 'utf8'),
            base
        );
    }

    /**
     * add custom ssr client plugin in config
     */
    addSSRClientPlugin() {
        this.clientConfig.plugins.push(
            new VueSSRClientPlugin({
                filename: join(LAVAS_DIRNAME_IN_DIST, CLIENT_MANIFEST)
            })
        );
    }

    /**
     * create renderer with built serverBundle & clientManifest in production mode
     */
    async createWithBundle() {
        this.serverBundle = await readJson(distLavasPath(this.cwd, SERVER_BUNDLE));

        let templatePath = distLavasPath(this.cwd, this.getTemplateName());
        let manifestPath = distLavasPath(this.cwd, CLIENT_MANIFEST);
        if (this.config.build.ssr) {
            this.template = await readFile(templatePath, 'utf-8');
            this.clientManifest = await readJson(manifestPath);
        }

        await this.createRenderer();
    }

    async buildProd() {
        this.addSSRClientPlugin();

        // start to build client & server configs
        await webpackCompile([this.clientConfig, this.serverConfig]);

        // copy index.template.html to dist/lavas/
        if (this.config.build.ssr) {
            let templateContent = await this.getTemplate(this.config.router.base);
            let distTemplatePath = distLavasPath(
                this.config.build.path,
                this.getTemplateName()
            );

            await outputFile(distTemplatePath, templateContent);
        }
    }

    async buildDev() {
        let lavasDir = join(this.rootDir, './.lavas');

        // add watcher for each template
        let templatePath = this.getTemplatePath();
        this.addWatcher(templatePath, 'change', async () => {
            await this.refreshFiles();
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

        let clientManifestPath = distLavasPath(this.clientConfig.output.path, CLIENT_MANIFEST);
        if (this.clientMFS.existsSync(clientManifestPath)) {
            let clientManifestContent = this.clientMFS.readFileSync(clientManifestPath, 'utf-8');
            if (this.clientManifest && JSON.stringify(this.clientManifest) !== clientManifestContent) {
                changed = true;
            }
            this.clientManifest = JSON.parse(clientManifestContent);
        }

        let serverBundlePath = distLavasPath(this.serverConfig.output.path, SERVER_BUNDLE);
        if (this.serverMFS.existsSync(serverBundlePath)) {
            let serverBundleContent = this.serverMFS.readFileSync(serverBundlePath, 'utf8');
            if (this.serverBundle && JSON.stringify(this.serverBundle) !== serverBundleContent) {
                changed = true;
            }
            this.serverBundle = JSON.parse(serverBundleContent);
        }

        let templateContent = await this.getTemplate(this.config.router.base);
        if (this.template !== templateContent) {
            changed = true;
            templateChanged = true;
        }
        this.template = templateContent;

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
        this.clientConfig.name = 'ssrclient';
        this.clientConfig.entry = {[DEFAULT_ENTRY_NAME]: ['./core/entry-client.js']};

        this.serverConfig.context = this.rootDir;
        this.serverConfig.entry = './core/entry-server.js';
    }

    /**
     * create renderer
     */
    async createRenderer() {
        if (this.serverBundle && this.clientManifest) {
            let isFirstTime = !this.renderer;
            this.renderer = createBundleRenderer(
                this.serverBundle,
                {
                    template: this.template,
                    clientManifest: this.clientManifest,
                    shouldPrefetch: (file, type) => {
                        if (type === 'script') {
                            // exclude the workbox files in /static copied by copy-webpack-plugin
                            return !/(workbox-v\d+\.\d+\.\d+.*)|(sw-register\.js)|(precache-manifest\.)/.test(file);
                        }
                        return true;
                    },
                    runInNewContext: false,
                    inject: false
                }
            );

            // If this is the first time, use resolve
            if (isFirstTime) {
                this.resolve(this.renderer);
            }
        }
    }

    async render(context = {}) {
        let ctx = {};

        // merge with default context
        merge(ctx, {
            title: 'Lavas', // default title
            config: this.config, // mount config to ctx which will be used when rendering template
        }, context);

        let renderer = await (this.renderer
            ? Promise.resolve(this.renderer) : this.readyPromise);

        // render to string
        return new Promise(resolve => {
            renderer.renderToString(ctx, (err, html) => {
                return resolve({err, html});
            });
        });
    }
}
