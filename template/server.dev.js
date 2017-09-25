/**
 * @file server.js
 * @author lavas
 */

const LavasCore = require('./lib');
const Koa = require('koa');
const app = new Koa();

let port = process.env.PORT || 3000;

let core = new LavasCore(__dirname);

core.init('development', true).then(() => {
    return core.build();
}).then(() => {
    app.use(core.koaMiddleware());

    app.listen(port, () => {
        console.log('server started at localhost:' + port);
    });
}).catch((err) => {
    console.log(err);
});
