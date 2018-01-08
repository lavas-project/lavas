/**
 * @file index.js
 * @author lavas
 */

import Renderer from './renderer';
import ConfigReader from './config-reader';
import ProdBuilder from './builder/prod-builder';
import DevBuilder from './builder/dev-builder';
import MiddlewareComposer from './middleware-composer';

import ora from 'ora';
import EventEmitter from 'events';

export default class LavasCore extends EventEmitter {
    constructor(cwd = process.cwd()) {
        super();
        this.cwd = cwd;
    }

    /**
     * invoked before build & runAfterBuild, do something different in each senario
     *
     * @param {string} env NODE_ENV
     * @param {boolean} isInBuild is in build process
     */
    async init(env, isInBuild) {
        this.env = env;
        this.isProd = this.env === 'production';
        this.configReader = new ConfigReader(this.cwd, this.env);

        /**
         * in a build process, we need to read config by scan a directory,
         * but for online server after build, we just read config.json directly
         */
        if (isInBuild) {
            // scan directory
            this.config = await this.configReader.read();
        }
        else {
            // read config from config.json
            this.config = await this.configReader.readConfigFile();
        }

        this.middlewareComposer = new MiddlewareComposer(this);
        this.renderer = new Renderer(this);
        this.builder = this.isProd
            ? new ProdBuilder(this) : new DevBuilder(this);

        // expose Koa & express middleware factory function
        this.koaMiddleware = this.middlewareComposer.koa
            .bind(this.middlewareComposer);
        this.expressMiddleware = this.middlewareComposer.express
            .bind(this.middlewareComposer);

        // expose render function
        this.render = this.renderer.render.bind(this.renderer);

        if (!this.isProd) {
            // register rebuild listener
            this.on('start-rebuild', async () => {
                // read config again
                let newConfig = await this.configReader.read();

                // init builder again
                this.builder.init(newConfig);

                // clean middlewares
                this.middlewareComposer.reset(newConfig);

                // notify the server that it needs to restart
                this.emit('rebuild');
            });
        }
    }

    /**
     * build in dev & prod mode
     *
     */
    async build() {
        let spinner = ora();
        spinner.start();

        if (!this.isProd) {
            this.middlewareComposer.setup();
        }
        try {
            await this.builder.build();
            spinner.succeed(`[Lavas] ${this.env} build completed.`);
        }
        catch (e) {
            console.log(e);
            spinner.fail(`[Lavas] ${this.env} build failed.`)
        }

    }

    /**
     * must run after build in prod mode
     *
     */
    async runAfterBuild() {
        this.middlewareComposer.setup();
        this.renderer = new Renderer(this);
        // create with bundle & manifest
        await this.renderer.createWithBundle();
    }

    /**
     * close builder in development mode
     *
     */
    async close() {
        await this.builder.close();
        console.log('[Lavas] lavas closed.');
    }

    /**
     * add flag to req which will be ignored by lavas middlewares
     *
     * @param {Request} req req
     */
    ignore(req) {
        req.lavasIgnoreFlag = true;
    }
}
