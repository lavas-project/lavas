/**
 * @file index.js
 * @author lavas
 */

import ConfigReader from './config-reader';

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
     * @param {Object} options options
     * @param {string} options.config custom config file path
     */
    async init(env, isInBuild, options = {}) {
        this.env = env;
        this.isProd = this.env === 'production';
        this.configReader = new ConfigReader(this.cwd, this.env, options.config);

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

        if (this.isProd) {
            const ProdBuilder = require('./builder/prod-builder');
            this.builder = new ProdBuilder(this);
        }
        else {
            const DevBuilder = require('./builder/dev-builder');
            this.builder = new DevBuilder(this);

            const MiddlewareComposer = require('./middleware-composer');
            this.middlewareComposer = new MiddlewareComposer(this);
            // expose express middleware factory function
            this.expressMiddleware = this.middlewareComposer.express
                .bind(this.middlewareComposer);

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

        try {
            await this.builder.build();
            spinner.succeed(`[Lavas] ${this.env} build completed.`);
        }
        catch (e) {
            console.error(e);
            spinner.fail(`[Lavas] ${this.env} build failed.`);
            throw(e);
        }

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
