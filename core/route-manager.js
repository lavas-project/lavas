/**
 * @file route manager
 * @author panyuqi
 * @desc generate route.js, multi entries in .lavas directory
 */

'use strict';

import {readFile, outputFile} from 'fs-extra';
import {join} from 'path';
import {createHash} from 'crypto';
import serialize from 'serialize-javascript';
import template from 'lodash.template';

import {generateRoutes, matchUrl, routes2Reg} from './utils/router';
import {writeFileInDev} from './utils/webpack';
import {distLavasPath} from './utils/path';

const routerTemplate = join(__dirname, './templates/router.tmpl');

export default class RouteManager {

    constructor(config = {}, env) {
        this.config = config;
        this.isDev = env === 'development';

        if (this.config.globals && this.config.globals.rootDir) {
            this.lavasDir = join(this.config.globals.rootDir, './.lavas');
        }

        this.routes = [];

        this.flatRoutes = new Set();

        this.errorRoute;
    }

    /**
     * rewrite route path with rules
     *
     * @param {Array} rewriteRules rewrite rules
     * @param {string} path original route path
     * @return {string} path rewrited
     */
    rewriteRoutePath(rewriteRules, path) {
        for (let i = 0; i < rewriteRules.length; i++) {
            let rule = rewriteRules[i];
            let {from, to} = rule;
            /**
             * if type of 'from' is regexp, use String.replace
             */
            if (from instanceof RegExp && from.test(path)) {
                return path.replace(from, to);
            }
            /**
             * if type of 'from' is array|string, 'to' must be a
             * single rule, just replace with it
             */
            else if ((Array.isArray(from) && from.includes(path))
                || (typeof from === 'string' && from === path)) {
                return to;
            }
        }
        return path;
    }

    /**
     * merge routes with config recursively
     *
     * @param {Array} routes routes
     * @param {Array} routesConfig config
     * @param {Array} rewriteRules rewriteRules
     * @param {Array} parentPath parentPath
     */
    mergeWithConfig(routes, routesConfig = [], rewriteRules = [], parentPath = '') {
        /**
         * In dev mode, we need to add timestamp to every route's hash as prefix.
         * otherwise when we change the code in page.vue, route's hash remains the same,
         * webpack hot middleware will throw a "Duplicate declaration" error.
         */
        let timestamp = this.isDev ? (new Date()).getTime() : '';

        routes.forEach(route => {

            // add to set
            this.flatRoutes.add(route);

            // rewrite route path with rules
            route.rewritePath = this.rewriteRoutePath(rewriteRules, route.path);
            route.fullPath = parentPath ? `${parentPath}/${route.path}` : route.path;

            // find error route
            if (route.fullPath === this.config.errorHandler.errorPath) {
                this.errorRoute = route;
                // add default error route alias
                this.errorRoute.alias = '*';
            }
            // map entry to every route
            else {
                let entry = this.config.entry.find(
                    entryConfig => matchUrl(entryConfig.routes, route.fullPath)
                );

                if (entry) {
                    route.entryName = entry.name;
                }
            }

            // find route in config
            let routeConfig = routesConfig.find(function ({pattern}) {
                return pattern instanceof RegExp
                    ? pattern.test(route.fullPath) : pattern === route.fullPath;
            });

            // mixin with config, rewrites path, add lazyLoading, meta
            if (routeConfig) {
                let {
                    path: routePath,
                    lazyLoading,
                    chunkname
                } = routeConfig;

                Object.assign(route, routeConfig, {
                    rewritePath: routePath || route.rewritePath,
                    lazyLoading: lazyLoading || !!chunkname
                });
            }

            /**
             * generate hash for each route which will be used in routes.js template,
             * an underscore "_" will be added in front of each hash, because JS variables can't
             * start with numbers
             */
            route.hash = timestamp + createHash('md5').update(route.component).digest('hex');

            /**
             * turn route fullpath into regexp
             * eg. /detail/:id => /^\/detail\/[^\/]+\/?$/
             */
            route.pathRegExp = route.rewritePath === '*'
                ? /^.*$/
                : routes2Reg(route.rewritePath);

            // merge recursively
            if (route.children && route.children.length) {
                this.mergeWithConfig(route.children, routesConfig, rewriteRules, route.fullPath);
            }
        });
    }

    /**
     * generate routes content which will be injected into routes.js
     * based on nested routes
     *
     * @param {Array} routes route list
     * @return {string} content
     */
    generateRoutesContent(routes) {
        const generate = routes => routes.map(cur => {
            // Call `this.$router.replace({name: xxx})` when path of 'xxx' contains '*' will throw error
            // see https://github.com/vuejs/vue-router/issues/724
            // Solution: write a normal path and add alias with '*'
            let route = {
                path: cur.rewritePath,
                component: `_${cur.hash}`,
                meta: cur.meta || {}
            };

            if (cur.name) {
                route.name = cur.name;
            }

            if (cur.alias) {
                route.alias = cur.alias;
            }

            if (cur.children) {
                route.children = generate(cur.children);
            }

            return route;
        });

        return JSON.stringify(generate(routes), undefined, 4)
            .replace(/"component": "(_.+)"/mg, '"component": $1');
    }

    /**
     * write routes.js for each entry
     *
     */
    async writeRoutesSourceFile() {
        let writeFile = this.isDev ? writeFileInDev : outputFile;

        await Promise.all(this.config.entry.map(async entryConfig => {
            let {
                name: entryName,
                mode = 'history',
                base = '/',
                pageTransition = {enable: false},
                scrollBehavior
            } = entryConfig;

            let entryRoutes = this.routes.filter(route => route.entryName === entryName);
            let entryFlatRoutes = new Set();
            this.flatRoutes.forEach(flatRoute => {
                if (flatRoute.entryName === entryName) {
                    entryFlatRoutes.add(flatRoute);
                }
            });

            // set page transition, support 2 types: slide|fade
            let transitionType = pageTransition.type;
            if (transitionType === 'slide') {
                pageTransition = Object.assign({
                    enable: true,
                    slideLeftClass: 'slide-left',
                    slideRightClass: 'slide-right',
                    alwaysBackPages: ['index'],
                    alwaysForwardPages: []
                }, pageTransition);
            }
            else if (transitionType) {
                pageTransition = Object.assign({
                    enable: true,
                    transitionClass: transitionType
                }, pageTransition);
            }
            else {
                console.log('[Lavas] page transition type is required.');
                pageTransition = {enable: false};
            }

            // add error route
            entryRoutes.push(this.errorRoute);
            entryFlatRoutes.add(this.errorRoute);

            // scrollBehavior
            if (scrollBehavior) {
                scrollBehavior = serialize(scrollBehavior).replace('scrollBehavior(', 'function(');
            }

            let routesFilePath = join(this.lavasDir, `${entryName}/router.js`);
            let routesContent = this.generateRoutesContent(entryRoutes);

            let routesFileContent = template(await readFile(routerTemplate, 'utf8'))({
                router: {
                    mode,
                    base,
                    routes: entryFlatRoutes,
                    scrollBehavior,
                    pageTransition
                },
                routesContent
            });
            await writeFile(routesFilePath, routesFileContent);
        }));
    }

    async writeRouresJsonFile() {
        let generateRoutesJson = route => {
            let tmpRoute = {
                path: route.rewritePath,
                name: route.name,
                meta: route.meta || {}
            };

            if (route.alias) {
                tmpRoute.alias = route.alias;
            }

            if (route.children) {
                tmpRoute.children = [];
                route.children.forEach(child => tmpRoute.children.push(generateRoutesJson(child)));
            }

            return tmpRoute;
        };

        let routesJson = [];
        this.routes.forEach(route => routesJson.push(generateRoutesJson(route)));

        await outputFile(
            distLavasPath(this.config.build.path, 'routes.json'),
            JSON.stringify({routes: routesJson}, null, 4));
    }

    /**
     * output routes.js into .lavas according to /pages
     *
     */
    async buildRoutes() {
        const {routes: routesConfig = [], rewrite: rewriteRules = [], pathRule} = this.config.router;
        this.flatRoutes = new Set();

        console.log('[Lavas] auto compile routes...');

        // generate routes according to pages dir
        this.routes = await generateRoutes(join(this.lavasDir, '../pages'), {routerOption: {pathRule}});

        // merge with routes' config
        this.mergeWithConfig(this.routes, routesConfig, rewriteRules);

        // write routes for each entry
        await this.writeRoutesSourceFile();

        if (!this.isDev) {
            await this.writeRouresJsonFile();
        }

        console.log('[Lavas] all routes are already generated.');
    }
}
