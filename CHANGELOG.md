# Changelog

=======

## Lavas-core-vue [1.2.1] - 2018-9-3

- [Fix] 将依赖的 webpack-hot-middleware 的版本号固定在 `~2.22.0`，因为新发布的 `2.23.0` 会导致运行异常无法启动

## Lavas-core-vue [1.2.0] - 2018-8-27

__BREAK CHANGE__

- [Upgrade] 升级 Workbox 依赖到 3.x，__同时不再支持 2.x 的模板语法__
    * 模板 (`core/service-worker.js`) 的修改方法见 [#188](https://github.com/lavas-project/lavas/issues/188)
    * 对于升级了 lavas-core-vue 但是仍然使用旧版本模板的用户，Lavas 会弹出升级的提示
    * 如果想继续使用 workbox 2.x，可以把 lavas-core-vue 的版本固定在 1.1.x (1.1.13 是最后一个版本)
- [Feature] 增加 Service Worker 的启用/禁用功能，并且 __默认禁用__。需要在 `lavas.config.js` 的 `serviceWorker` 配置项增加 `enable: true` 来开启该功能
- [Upgrade] 将命令行输出的日志提示修改为中文
- [Fix] 将依赖的 workbox-chain 的版本号固定在 `4.8.0`，因为新版本会出现不稳定的错误

## Lavas-core-vue [1.1.12] - 2018-4-27

- [Fix] Fix a problem causing rendering failure ([#147][i147])
- [Fix] Fix a problem when using lavas-core-vue without lavas-cli ([#148][i148])

[i147]: https://github.com/lavas-project/lavas/issues/147
[i148]: https://github.com/lavas-project/lavas/issues/148

## Lavas-core-vue [1.1.11] - 2018-4-18

- [Fix] Remove `.babelrc` in templates. Use `build.babel` option in `lavas.config.js`.

## Lavas-core-vue [1.1.10] - 2018-4-13

- [Fix] Add postcss-loader to all of CSS preprocessers' rules. ([#134][i134])
- [Feature] Add `route.redirect` option in `lavas.config.js`.

[i134]: https://github.com/lavas-project/lavas/issues/134

## Lavas [2.2.7] - 2018-4-10

- [Feature] Add lavas-core-vue version to `lavas -v` ([#126][i126])

[i126]: https://github.com/lavas-project/lavas/issues/126

## Lavas-core-vue [1.1.9] - 2018-4-10

- [Fix] Update sw-register-webpack-plugin to 1.0.20 ([#9][i9])
- [Fix] Fix a problem when using CDN ([#128][i128])

[i9]: https://github.com/lavas-project/sw-register-webpack-plugin/issues/9
[i128]: https://github.com/lavas-project/lavas/issues/128

## Lavas-core-vue [1.1.8] - 2018-3-27

- [Fix] Fix a problem caused by `<transition>` & `<keep-alive>`. ([#112][i112])

[i112]: https://github.com/lavas-project/lavas/issues/112

## Lavas-core-vue [1.1.7] - 2018-3-26

- [Fix] Update vue-loader to 14.2.2. ([#114][i114])

[i114]: https://github.com/lavas-project/lavas/issues/114

## Lavas-core-vue [1.1.6] - 2018-3-22

- [Fix] Fix routing generation problems when recursive directories appeared in `/pages`

## Lavas [2.2.6] - 2018-3-16

- [Fix] Fix problems when running `lavas build` without running `lavas dev`.

## Lavas-core-vue [1.1.5] - 2018-3-13

- [Optimization] Less loading time in SPA mode. ([#73][i73])

[i40]: https://github.com/lavas-project/lavas/issues/40

## Lavas-core-vue [1.1.4] - 2018-3-9

- [Fix] Resume supporting `context.type === 'base'` in `extend` function in `lavas.config.js`

## Lavas-core-vue [1.1.3] - 2018-3-8

- [Fix] Change `targets.node` from `current` to `"6.9"` in `.babelrc`
- [Fix] Fix problems when executing `lavas start` and ssr = true
- [Fix] Support workbox v2.1.3

## Lavas-core-vue [1.1.2] - 2018-3-7

- [Fix] Fix 'supportHistory is undefined' when ssr = false and pageTransition = fade (by default)
- [Fix] Support page name contains `_` (`about_us.vue`)
- [Fix] Resume reference to `sw-register.js` in `dist/index.html` when ssr = false

## Lavas-core-vue [1.1.1] - 2018-3-6

- [Info] Bump version to 1.1
- [Feature] Support `spa.html.tmpl` and `ssr.html.tmpl`. ([#40][i40])
- [Fix] remove `async` and `await` in `.lavas/build.js`

[i40]: https://github.com/lavas-project/lavas/issues/40

## Lavas-core-vue [1.0.7] - 2018-2-28

- [Feature] Use progress-bar-webpack-plugin for better console logging effect. ([#55][i55])
- [Feature] Use webpack-chain and add `build.extendWithWebpackChain()` in `lavas.config.js`. ([#76][i76])
- [Feature] Optimize building process. ([#77][i77])

[i55]: https://github.com/lavas-project/lavas/issues/55
[i76]: https://github.com/lavas-project/lavas/issues/76
[i77]: https://github.com/lavas-project/lavas/issues/77

## Lavas-core-vue [1.0.6-rc.6] - 2018-1-29

- [Feature] Support MPA (multi entries with ssr: `false`)

## Lavas-core-vue [1.0.4] - 2018-1-18

- [Fix] Use CommonsChunkPlugin correctly. ([#38][i38])
- [Fix] Hotreload will not reload infinitely now. ([#43][i43] [#36][i36])
- [Fix] New version of `core/index.html.tmpl` can work with older version of lavas correctly ([#52][i52])
- [Feature] Split test fixture into multiple projects, eg. a `simple` folder is used by some simple test cases.

[i36]: https://github.com/lavas-project/lavas/issues/36
[i38]: https://github.com/lavas-project/lavas/issues/38
[i43]: https://github.com/lavas-project/lavas/issues/43
[i52]: https://github.com/lavas-project/lavas/issues/52

## Lavas-core-vue [1.0.4-rc.1] - 2018-1-17

- [Feature] Allow developers use custom variables in `core/index.html.tmpl`
- [Fix] Developers with old version of lavas (≤ 2.2.2) can use `lavas dev` correctly.

## Lavas-core-vue [1.0.2-rc.0] - 2018-1-10

- [Feature] Add `config` option to `lavas dev`, `lavas start` and `lavas build`.
- [Feature] Lavas internal middlewares such as `static`, `service-worker`, `ssr`, `error` and `favicon` can be toggled by calling `express/koaMiddleware()`.
- [Feature] Provide `render()` function so that a custom SSR middleware can be used in SSR mode.

## Lavas-core-vue [1.0.1-rc.1] - 2018-1-8

- [Fix] In development mode, if we detect the `publicPath` is from CDN (eg. starts with `http(s)://` or `//`), a default path `/` will be used instead. But in production mode, the CDN `publicPath` will be used as assets' prefix correctly.

## [2.1.8-rc.2] - 2018-1-3

- [Feature] Add `build.skeleton` in config. In SPA, you can toggle skeleton feature by `build.skeleton.enable` and change `core/Skeleton.vue` with `build.skeleton.path`.
- [Feature] Inject some lines in `core/service-worker.js`:
    - Auto prefix when using `publicPath`. eg. `importScripts('${publicPath}static/js/workbox-sw.prod.v2.1.2.js');`
    - Auto add `workboxSW.router.registerNavigationRoute();` at the end of the file. You don't need to modify when switching between `SSR` and `SPA` manually.
- [Fix] Bug in switching from `SPA` to `SSR`.

## [2.1.8-rc.1] - 2018-1-2

- [Fix] `cssExtract` in production mode.
- [Fix] Update to Webpack@3.x.
- [Breaking Change] Remove `entry` in config.

## [2.0.7-rc.4] - 2017-12-20
- [Fix] Move `babel` option into `build` in `lavas.config.js`.
- [Feature] Use `workbox-webpack-plugin@3.0.0-alpha.3` which has following changes:
    - We don't need putting `importScript()` in front of `service-worker.js` any more.
    - Precache all assets generated by the webpack compilation. Use `chunks` instead of `globDirectory` and `globPatterns`. This will also fix the problem in development mode with `webpack-dev-middleware`.

## [2.0.7-rc.3] - 2017-12-5
- [Fix] Make build works when BUILD_PATH in `lavas.config.js` changes to other directory.
- [Fix] Move manifest from `lavas.config.js` to single JSON file.
- [Feature] Generate `dist/lavas/routes.json` which contains all router rules.

## [2.0.7-rc.2] - 2017-12-2
- [Fix] Those server deps required by server-side middlewares shouldn't exist in client side(main.[hash].js) and vice versa.

## [2.0.7] - 2017-11-30

- [Lavas Core] Simplify `dist/lavas/config.json` after production building, only preserve some runtime-aware options.
    ```
    // dist/lavas/config.json
    {
        build: {
            publicPath: true,
            compress: true
        },
        entry: true,
        middleware: true,
        router: true,
        errorHandler: true,
        manifest: true,
        serviceWorker: {
            swDest: true
        }
    }
    ```
- [Fix] Make `config.defines` works and add relative test cases.
- [Fix] Merge middlewares defined in config correctly. Use `lodash.merge` to concat two arrays during merging.
- [Fix] `config.router` use different strategies under the following scenes:
    - Apply `rewrite.from` to `route.path`.
    - Apply `routes.pattern` to `route.fullPath`.
- [Fix] Simplify `dist/config.json` after production building, only preserve some required options.

## [2.0.5] - 2017-11-29

- Use coveralls for keeping test coverage history. Also integrate it with travis.
- [Lavas CLI] Add `lavas dev/start/build` command.
- [Lavas Core] Require some Koa's deps such as some middlewares conditionally so that it can run in node < 7.6.0. If users want to use `koaMiddleware`, they must upgrade their node.
- Add a common test case. It will test for Koa when node >= 7.6.0 and express otherwise.
- [Fix] Use vue-loader@13.0.2 for Node 5.x. The latest vue-loader already drops support for Node 4.x.[ISSUE](https://github.com/vuejs/vue-loader/issues/1010)
- [Fix] express-error.js use `302` rather than `301` as redirect status code.
- [Fix] Rebuild when lavas.config.js changed.
