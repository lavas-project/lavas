/**
 * @file test case for utils/loader.js
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {vueLoaders, cssLoaders, styleLoaders} from '../../../dist/core/utils/loader';
import test from 'ava';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

// cssLoaders
test('it should generate cssLoaders with minimize and sourceMap', async t => {
    let loaders = cssLoaders({
        minimize: true,
        sourceMap: true,
        extract: false
    });
    let expectedCssLoader = {
        loader: 'css-loader',
        options: {
            minimize: true,
            sourceMap: true
        }
    };

    t.deepEqual(loaders.css, ['vue-style-loader', expectedCssLoader]);
    t.deepEqual(loaders.postcss, ['vue-style-loader', expectedCssLoader]);
    t.deepEqual(loaders.less, ['vue-style-loader', expectedCssLoader, {
        loader: 'less-loader',
        options: {
            sourceMap: true
        }
    }]);
    t.deepEqual(loaders.sass, ['vue-style-loader', expectedCssLoader, {
        loader: 'sass-loader',
        options: {
            indentedSyntax: true,
            sourceMap: true
        }
    }]);
    t.deepEqual(loaders.scss, ['vue-style-loader', expectedCssLoader, {
        loader: 'sass-loader',
        options: {
            sourceMap: true
        }
    }]);
    t.deepEqual(loaders.stylus, ['vue-style-loader', expectedCssLoader, {
        loader: 'stylus-loader',
        options: {
            sourceMap: true
        }
    }]);
    t.deepEqual(loaders.styl, ['vue-style-loader', expectedCssLoader, {
        loader: 'stylus-loader',
        options: {
            sourceMap: true
        }
    }]);
});

test('it should generate cssLoaders with extract', async t => {
    let loaders = cssLoaders({
        minimize: false,
        sourceMap: false,
        extract: true
    });
    let expectedCssLoader = {
        loader: 'css-loader',
        options: {
            minimize: false,
            sourceMap: false
        }
    };

    t.deepEqual(loaders.css, ExtractTextPlugin.extract({
        use: [expectedCssLoader],
        fallback: 'vue-style-loader'
    }));
    t.deepEqual(loaders.postcss, ExtractTextPlugin.extract({
        use: [expectedCssLoader],
        fallback: 'vue-style-loader'
    }));
    t.deepEqual(loaders.less, ExtractTextPlugin.extract({
        use: [
            expectedCssLoader,
            {
                loader: 'less-loader',
                options: {
                    sourceMap: false
                }
            }
        ],
        fallback: 'vue-style-loader'
    }));
    t.deepEqual(loaders.sass, ExtractTextPlugin.extract({
        use: [
            expectedCssLoader,
            {
                loader: 'sass-loader',
                options: {
                    indentedSyntax: true,
                    sourceMap: false
                }
            }
        ],
        fallback: 'vue-style-loader'
    }));
    t.deepEqual(loaders.scss, ExtractTextPlugin.extract({
        use: [
            expectedCssLoader,
            {
                loader: 'sass-loader',
                options: {
                    sourceMap: false
                }
            }
        ],
        fallback: 'vue-style-loader'
    }));
    t.deepEqual(loaders.stylus, ExtractTextPlugin.extract({
        use: [
            expectedCssLoader,
            {
                loader: 'stylus-loader',
                options: {
                    sourceMap: false
                }
            }
        ],
        fallback: 'vue-style-loader'
    }));
    t.deepEqual(loaders.styl, ExtractTextPlugin.extract({
        use: [
            expectedCssLoader,
            {
                loader: 'stylus-loader',
                options: {
                    sourceMap: false
                }
            }
        ],
        fallback: 'vue-style-loader'
    }));
});

// vueLoaders
test('it should generate vueLoaders', async t => {
    let vueLoadersResult = vueLoaders({
        cssMinimize: true,
        cssSourceMap: true,
        cssExtract: false
    });
    let expectedCssLoader = {
        loader: 'css-loader',
        options: {
            minimize: true,
            sourceMap: true
        }
    };

    t.deepEqual(vueLoadersResult.loaders.css, ['vue-style-loader', expectedCssLoader]);
    t.deepEqual(vueLoadersResult.loaders.postcss, ['vue-style-loader', expectedCssLoader]);
    t.deepEqual(vueLoadersResult.loaders.less, ['vue-style-loader', expectedCssLoader, {
        loader: 'less-loader',
        options: {
            sourceMap: true
        }
    }]);
    t.deepEqual(vueLoadersResult.loaders.sass, ['vue-style-loader', expectedCssLoader, {
        loader: 'sass-loader',
        options: {
            indentedSyntax: true,
            sourceMap: true
        }
    }]);
    t.deepEqual(vueLoadersResult.loaders.scss, ['vue-style-loader', expectedCssLoader, {
        loader: 'sass-loader',
        options: {
            sourceMap: true
        }
    }]);
    t.deepEqual(vueLoadersResult.loaders.stylus, ['vue-style-loader', expectedCssLoader, {
        loader: 'stylus-loader',
        options: {
            sourceMap: true
        }
    }]);
    t.deepEqual(vueLoadersResult.loaders.styl, ['vue-style-loader', expectedCssLoader, {
        loader: 'stylus-loader',
        options: {
            sourceMap: true
        }
    }]);
});

// styleLoaders
test('it should generate styleLoaders', async t => {
    let loaders = styleLoaders({
        minimize: true,
        sourceMap: true,
        extract: false
    });
    let expectedCssLoader = {
        loader: 'css-loader',
        options: {
            minimize: true,
            sourceMap: true
        }
    };

    t.deepEqual(loaders, [{
        test: new RegExp(/\.css$/),
        use: ['vue-style-loader', expectedCssLoader]
    }, {
        test: new RegExp(/\.postcss$/),
        use: ['vue-style-loader', expectedCssLoader]
    }, {
        test: new RegExp(/\.less$/),
        use: ['vue-style-loader', expectedCssLoader, {
            loader: 'less-loader',
            options: {
                sourceMap: true
            }
        }]
    }, {
        test: new RegExp(/\.sass$/),
        use: ['vue-style-loader', expectedCssLoader, {
            loader: 'sass-loader',
            options: {
                indentedSyntax: true,
                sourceMap: true
            }
        }]
    }, {
        test: new RegExp(/\.scss$/),
        use: ['vue-style-loader', expectedCssLoader, {
            loader: 'sass-loader',
            options: {
                sourceMap: true
            }
        }]
    }, {
        test: new RegExp(/\.stylus$/),
        use: ['vue-style-loader', expectedCssLoader, {
            loader: 'stylus-loader',
            options: {
                sourceMap: true
            }
        }]
    }, {
        test: new RegExp(/\.styl$/),
        use: ['vue-style-loader', expectedCssLoader, {
            loader: 'stylus-loader',
            options: {
                sourceMap: true
            }
        }]
    }])
});
