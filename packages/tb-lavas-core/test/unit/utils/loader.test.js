/**
 * @file test case for utils/loader.js
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {vueLoaders, cssLoaders, styleLoaders} from '../../../core/utils/loader';
import test from 'ava';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

// cssLoaders
let defaultExpectedCssLoader = {
    loader: 'css-loader',
    options: {
        minimize: true,
        sourceMap: true
    }
};
let defaultExpectedPostcssLoader = {
    loader: 'postcss-loader',
    options: {
        sourceMap: true
    }
};
test('it should generate cssLoaders with minimize and sourceMap', async t => {
    let loaders = cssLoaders({
        cssSourceMap: true,
        cssMinimize: true,
        cssExtract: false
    });
    let expectCss = [defaultExpectedCssLoader, defaultExpectedPostcssLoader];
    t.deepEqual(loaders.css, ['vue-style-loader', ...expectCss]);
    t.deepEqual(loaders.postcss, ['vue-style-loader', ...expectCss]);
    t.deepEqual(loaders.less, ['vue-style-loader', ...expectCss, {
        loader: 'less-loader',
        options: {
            sourceMap: true
        }
    }]);
    t.deepEqual(loaders.sass, ['vue-style-loader', ...expectCss, {
        loader: 'sass-loader',
        options: {
            indentedSyntax: true,
            sourceMap: true
        }
    }]);
    t.deepEqual(loaders.scss, ['vue-style-loader', ...expectCss, {
        loader: 'sass-loader',
        options: {
            sourceMap: true
        }
    }]);
    t.deepEqual(loaders.stylus, ['vue-style-loader', ...expectCss, {
        loader: 'stylus-loader',
        options: {
            sourceMap: true
        }
    }]);
    t.deepEqual(loaders.styl, ['vue-style-loader', ...expectCss, {
        loader: 'stylus-loader',
        options: {
            sourceMap: true
        }
    }]);
});

test('it should generate cssLoaders with extract', async t => {
    let loaders = cssLoaders({
        cssSourceMap: false,
        cssMinimize: false,
        cssExtract: true
    });
    let expectedCssLoader = {
        loader: 'css-loader',
        options: {
            minimize: false,
            sourceMap: false
        }
    };
    let expectedPostcssLoader = {
        loader: 'postcss-loader',
        options: {
            sourceMap: false
        }
    };
    let expectCss = [expectedCssLoader, expectedPostcssLoader];
    t.deepEqual(loaders.css, ExtractTextPlugin.extract({
        use: expectCss,
        fallback: 'vue-style-loader'
    }));
    t.deepEqual(loaders.postcss, ExtractTextPlugin.extract({
        use: expectCss,
        fallback: 'vue-style-loader'
    }));
    t.deepEqual(loaders.less, ExtractTextPlugin.extract({
        use: [
            ...expectCss,
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
            ...expectCss,
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
            ...expectCss,
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
            ...expectCss,
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
            ...expectCss,
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
    let expectCss = [defaultExpectedCssLoader, defaultExpectedPostcssLoader];
    t.deepEqual(vueLoadersResult.loaders.css, ['vue-style-loader', ...expectCss]);
    t.deepEqual(vueLoadersResult.loaders.postcss, ['vue-style-loader', ...expectCss]);
    t.deepEqual(vueLoadersResult.loaders.less, ['vue-style-loader', ...expectCss, {
        loader: 'less-loader',
        options: {
            sourceMap: true
        }
    }]);
    t.deepEqual(vueLoadersResult.loaders.sass, ['vue-style-loader', ...expectCss, {
        loader: 'sass-loader',
        options: {
            indentedSyntax: true,
            sourceMap: true
        }
    }]);
    t.deepEqual(vueLoadersResult.loaders.scss, ['vue-style-loader', ...expectCss, {
        loader: 'sass-loader',
        options: {
            sourceMap: true
        }
    }]);
    t.deepEqual(vueLoadersResult.loaders.stylus, ['vue-style-loader', ...expectCss, {
        loader: 'stylus-loader',
        options: {
            sourceMap: true
        }
    }]);
    t.deepEqual(vueLoadersResult.loaders.styl, ['vue-style-loader', ...expectCss, {
        loader: 'stylus-loader',
        options: {
            sourceMap: true
        }
    }]);
});

// styleLoaders
test('it should generate styleLoaders', async t => {
    let loaders = styleLoaders({
        cssSourceMap: true,
        cssMinimize: true,
        cssExtract: false
    });
    let expectCss = [defaultExpectedCssLoader, defaultExpectedPostcssLoader];
    t.deepEqual(loaders, [{
        test: new RegExp(/\.css$/),
        use: ['vue-style-loader', ...expectCss]
    }, {
        test: new RegExp(/\.postcss$/),
        use: ['vue-style-loader', ...expectCss]
    }, {
        test: new RegExp(/\.less$/),
        use: ['vue-style-loader', ...expectCss, {
            loader: 'less-loader',
            options: {
                sourceMap: true
            }
        }]
    }, {
        test: new RegExp(/\.sass$/),
        use: ['vue-style-loader', ...expectCss, {
            loader: 'sass-loader',
            options: {
                indentedSyntax: true,
                sourceMap: true
            }
        }]
    }, {
        test: new RegExp(/\.scss$/),
        use: ['vue-style-loader', ...expectCss, {
            loader: 'sass-loader',
            options: {
                sourceMap: true
            }
        }]
    }, {
        test: new RegExp(/\.stylus$/),
        use: ['vue-style-loader', ...expectCss, {
            loader: 'stylus-loader',
            options: {
                sourceMap: true
            }
        }]
    }, {
        test: new RegExp(/\.styl$/),
        use: ['vue-style-loader', ...expectCss, {
            loader: 'stylus-loader',
            options: {
                sourceMap: true
            }
        }]
    }]);
});
