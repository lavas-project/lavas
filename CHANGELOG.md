# Changelog

## [2.0.7] - 2017-11-30

### Changed
- [Fix] Merge middlewares defined in config correctly. Use `lodash.merge` to concat two arrays during merging.
- [Fix] lavas.config.router
    - Apply `rewrite.from` to `route.path`.
    - Apply `routes.pattern` to `route.fullPath`.
- [Fix] Simplify `dist/config.json` after production building, only preserve some required options.

## [2.0.5] - 2017-11-29

### Added
- Use coveralls for keeping test coverage history. Also integrate it with travis.
- [Lavas CLI] Add `lavas dev/start/build` command.
- [Lavas Core] Require some Koa's deps such as some middlewares conditionally so that it can run in node < 7.6.0. If users want to use `koaMiddleware`, they must upgrade their node.
- Add a common test case. It will test for Koa when node >= 7.6.0 and express otherwise.

### Changed
- [Fix] Use vue-loader@13.0.2 for Node 5.x. The latest vue-loader already drops support for Node 4.x.[ISSUE](https://github.com/vuejs/vue-loader/issues/1010)
- [Fix] express-error.js use `302` rather than `301` as redirect status code.
- [Fix] Rebuild when lavas.config.js changed.
