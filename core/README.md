lavas-core
===================

[![npm version](https://badge.fury.io/js/lavas-core.svg)](https://badge.fury.io/js/lavas-core)
[![Build Status](https://travis-ci.org/lavas-project/lavas-core.svg?branch=master)](https://travis-ci.org/lavas-project/lavas-core)

[![NPM](https://nodei.co/npm/lavas-core.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/lavas-core/)

Lavas 运行核心部分，执行以下步骤：
1. 读取配置，校验部分属性类型正确性
2. 根据文件结构和用户配置生成路由文件
3. 生成 manifest 和 bundle 文件，开发模式放在内存文件系统中
4. 开发模式下添加 webpack-dev-middleware 和 hot-middleware

开发模式下所有页面请求由服务端渲染。生产模式中针对配置了预渲染的页面，生成 html 并注入对应的 skeleton，这部分页面请求不经过服务端渲染，直接返回页面。

# 运行测试用例

koa 要求 Node 7+，所以测试用例也运行在这个版本之上
```bash
npm run test
```

# TODO

1. 生成嵌套路由 childRoutes
2. 中间件