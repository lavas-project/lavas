#!/usr/bin/env node

const parseArgs = require('minimist');
const fs = require('fs-extra');
const path = require('path');
const fork = require('child_process').fork;
const express = require('express');

const utils = require('../src/lib/utils');
const locals = require('../src/locals')();
const log = require('../src/lib/utils/log');
const app = express();

const argv = parseArgs(process.argv.slice(2));
const port = argv.p || argv.port || 3000;

async function staticServer(port) {
    log.info(locals.START_STATIC + '...');

    let routesJsonPath = path.resolve(process.cwd(), 'lavas/routes.json');

    // start static server with lavas routes configured
    if (await fs.pathExists(routesJsonPath)) {
        try {
            let baseUrl = require(routesJsonPath).base;
            if (!baseUrl || baseUrl === '/') {
                // redirect all requests to '/index.html'
                app.use(historyMiddleware({
                    htmlAcceptHeaders: ['text/html'],
                    disableDotRule: false // ignore paths with dot inside
                }));

                app.use(express.static('.'));
            } else {
                // fix trailing '/'
                // @see https://lavas.baidu.com/guide/v2/advanced/multi-lavas#express-%E5%A4%84%E7%90%86-spa-%E8%B7%AF%E7%94%B1%E7%9A%84%E5%B0%8F%E9%97%AE%E9%A2%98-%E6%89%A9%E5%B1%95
                if (!baseUrl.endsWith('/')) {
                    baseUrl += '/';
                }

                app.use('/', (req, res, next) => {
                    let requestUrl = req.url.replace(/\?.+?$/, '');

                    if (requestUrl === baseUrl.substring(0, baseUrl.length - 1)) {
                        req.url = requestUrl + '/';
                    }

                    next();
                });

                app.use(baseUrl, historyMiddleware({
                    htmlAcceptHeaders: ['text/html'],
                    disableDotRule: false // ignore paths with dot inside
                }));

                app.use(baseUrl, express.static('.'));
            }
        } catch (e) {}
    }
    // start a normal static server
    else {
        app.use(express.static('.'));
    }

    app.listen(port, () => log.info(`Static server start at localhost:${port}`));
}

staticServer(port);