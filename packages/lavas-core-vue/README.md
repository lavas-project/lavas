# Lavas Core Vue

Lavas Core 是 [Lavas](https://github.com/lavas-project/lavas) 解决方案的核心部分，目前支持 Vue 。后续我们会陆续支持 [React](https://reactjs.org/) 和 [San](https://ecomfe.github.io/san/)，给开发者提供更多选择，敬请期待。

常规情况下，开发者应当使用 Lavas 命令行进行开发和构建。这种最常用的方式可参考我们的[官方文档](https://lavas.baidu.com/guide) 和 [Codelab](https://lavas.baidu.com/codelab)。

## 以编程方式使用 Lavas Core

出于某些特定的偏好或者限制，如果开发者**不希望**通过命令行 (`lavas dev` 或者 `lavas build`) 启动 Lavas 项目，我们也允许开发者采用编程方式使用 Lavas。

### 启动开发环境

*作用等同于 `lavas dev`*

开发者可以参考项目根目录下的 `server.dev.js`。

```javascript
const LavasCore = require('lavas-core-vue');
const express = require('express');
const stoppable = require('stoppable');
const proxy = require('http-proxy-middleware');

/**
 * API Proxy Configuration
 *
 * @see https://github.com/chimurai/http-proxy-middleware
 * @type {Object}
 */
const proxyTable = {
    // proxy table example
    // '/api': {
    //     target: 'https://lavas.baidu.com',
    //     changeOrigin: true
    // }
};

let port = process.env.PORT || 3000;
// TODO: The only parameter indicates root path of Lavas project
let core = new LavasCore(__dirname);
let app;
let server;

process.env.NODE_ENV = 'development';

/**
 * start dev server
 */
function startDevServer() {


    app = express();
    core.build()
        .then(() => {
            // API Proxying during development
            Object.keys(proxyTable).forEach(pattern => {
                app.use(pattern, proxy(proxyTable[pattern]));
            });

            app.use(core.expressMiddleware());

            /**
             * server.close() only stop accepting new connections,
             * we need to close existing connections with help of stoppable
             */
            server = stoppable(app.listen(port, () => {
                console.log('server started at localhost:' + port);
            }));
        })
        .catch(err => {
            console.log(err);
        });
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

core.init(process.env.NODE_ENV || 'development', true)
    .then(() => startDevServer());

// catch promise error
process.on('unhandledRejection', err => {
    console.warn(err);
});
```

### 进行项目构建

*作用等同于 `lavas build`*

如果开发者启动过开发环境，可以参考 `.lavas/build.js`。

```javascript
const LavasCore = require('lavas-core-vue');
// TODO: The only parameter indicates root path of Lavas project
let core = new LavasCore(__dirname);

process.env.NODE_ENV = 'production';

async function startBuild() {
    await core.init(process.env.NODE_ENV, true);
    await core.build();
}

startBuild();

```

### 更多信息

经过实例化的 Lavas Core 对象(上述代码中均为变量 `core` ) 包含下列(值得开发者关心的)方法：

* core.init()
* core.build()
* core.expressMiddleware()
* core.koaMiddleware()

Lavas 默认集成了多个中间件，例如处理静态文件、处理 Lavas 本身的路由、处理 Service Worker 相关等等。

如果开发者想要更灵活地使用 `core` 提供的方法，例如选择性地使用某些中间件，或者调整中间件的顺序，插入自己的中间件等等，可以参阅[这篇文档](https://lavas.baidu.com/guide/v2/advanced/core-api) 和 [这篇 Codelab](https://lavas.baidu.com/codelab/core-api/01introduction) 加深理解。
