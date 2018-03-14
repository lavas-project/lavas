/**
 * @file server.js
 * @author lavas
 */

process.env.NODE_ENV = 'development';

const LavasCore = require('../../../dist');
const express = require('express');
// const Koa = require('koa');
const stoppable = require('stoppable');

let port = process.env.PORT || 3000;
let core = new LavasCore(__dirname);
let app;
let server;

function startDevServer() {
    app = express();
    // app = new Koa();
    core.build()
        .then(() => {

            app.use(core.expressMiddleware());

            /**
             * server.close() only stop accepting new connections,
             * we need to close existing connections with help of stoppable
             */
            server = stoppable(app.listen(port, () => {
                console.log('server started at localhost:' + port);
            }));
        }).catch(err => {
            console.log(err);
        });
}

let config;

// fix https://github.com/lavas-project/lavas/issues/50
if (process.argv.length >= 3 && process.argv[2] !== 'dev') {
    config = process.argv[2];
}

/**
 * every time lavas rebuild, stop current server first and restart
 */
core.on('rebuild', () => {
    core.close().then(() => {
        server.stop();
        startDevServer();
    });
});

core.init(process.env.NODE_ENV || 'development', true, {config})
    .then(() => startDevServer());

// catch promise error
process.on('unhandledRejection', err => {
    console.warn(err);
});
