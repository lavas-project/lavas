# Changelog

## [2.0.3] - 2017-11-29

### Added
- Use coveralls for keeping test coverage history. Also integrate it with travis.
- [Lavas CLI] Add `lavas dev/start/build` command.
- [Lavas Core] Require some Koa's deps such as some middlewares conditionally so that it can run in node < 7.6.0. If users want to use `koaMiddleware`, they must upgrade their node.
- Add a common test case. It will test for Koa when node >= 7.6.0 and express otherwise.

### Changed
- [Fix] Use vue-loader@13.0.2 for Node 5.x. The latest vue-loader already drops support for Node 4.x.[ISSUE](https://github.com/vuejs/vue-loader/issues/1010)
