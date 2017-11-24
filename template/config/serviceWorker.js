/**
 * @file 生成service-worker.js的配置项，被sw-precache-webpack-plugin使用
 *
 * 可使用参考链接
 * https://www.npmjs.com/package/sw-precache-webpack-plugin 具体的配置参数选择
 * https://github.com/GoogleChrome/sw-precache#handlefetch-boolean
 * https://metaquant.org/programing/sw-precache-guide.html
 *
 * @author Wangyisheng(wangyisheng@baidu.com)
 */

module.exports = {

    cacheId: 'sw-cache-*__name__*',

    filename: 'service-worker.js',

    /**
     * 需缓存的文件配置
     * 需动态缓存的放到runtimeCaching中处理
     *
     * @type {Array}
     */
    staticFileGlobs: [],

    /**
     * 需要根据路由动态处理的文件
     *
     * @type {Array}
     */
    runtimeCaching: [{
        urlPattern: /\/.*/,
        handler: 'networkFirst'
    }],

    /**
     * [mergeStaticsConfig description]
     *
     * @type {boolean}
     */
    mergeStaticsConfig: true,

    /**
     * 忽略跳过的文件
     *
     * @type {Array}
     */
    staticFileGlobsIgnorePatterns: [
        /\.map$/ // map文件不需要缓存
    ],

    /**
     * 需要省略掉的前缀名
     *
     * @type {string}
     */
    stripPrefix: 'dist/',

    /**
     * 当请求路径不在缓存里的返回，对于单页应用来说，入口点是一样的
     *
     * @type {string}
     */
    navigateFallback: '/index.html',

    /**
     * 白名单包含所有的.html (for HTML imports) 和
     * 路径中含’/data/’(for dynamically-loaded data).
     *
     * @type {Array}
     */
    navigateFallbackWhitelist: [/^(?!.*\.html$|\/data\/).*/],

    /**
     * 是否压缩，默认不压缩
     *
     * @type {boolean}
     */
    minify: true,

    /**
     * 是否 verbose
     *
     * @type {boolean}
     */
    verbose: true,

    /**
     * 资源被 precache 时，用于打印日志的回调函数
     * 默认是 console.log，这里设置一个空方法，隐藏 build 过程控制台的相关输出
     *
     * @type {Function}
     */
    logger: function () {}
};
