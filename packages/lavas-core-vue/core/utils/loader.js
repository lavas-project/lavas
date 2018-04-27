/**
 * @file utils.loader.js
 * @author lavas
 */
import ExtractTextPlugin from 'extract-text-webpack-plugin';

export function vueLoaders({cssSourceMap, cssMinimize, cssExtract, babelOptions}) {
    return {
        loaders: Object.assign({
            js: {
                loader: 'babel-loader',
                options: babelOptions
            }
        }, cssLoaders({
            cssSourceMap,
            cssMinimize,
            cssExtract
        }))
    };
}

export function cssLoaders({cssMinimize, cssSourceMap, cssExtract}) {

    const cssLoader = {
        loader: 'css-loader',
        options: {
            minimize: cssMinimize,
            sourceMap: cssSourceMap
        }
    };

    const postcssLoader = {
        loader: 'postcss-loader',
        options: {
            sourceMap: cssSourceMap
        }
    };

    // generate loader string to be used with extract text plugin
    function generateLoaders(loader, loaderOptions) {
        let loaders = [cssLoader, postcssLoader];

        if (loader) {
            loaders.push({
                loader: loader + '-loader',
                options: Object.assign({}, loaderOptions, {
                    sourceMap: cssSourceMap
                })
            });
        }

        // Extract CSS when that option is specified
        // (which is the case during production build)
        if (cssExtract) {
            return ExtractTextPlugin.extract({
                use: loaders,
                fallback: 'vue-style-loader'
            });
        }

        return ['vue-style-loader', ...loaders];
    }

    // https://vue-loader.vuejs.org/en/configurations/extract-css.html
    return {
        css: generateLoaders(),
        postcss: generateLoaders(),
        less: generateLoaders('less'),
        sass: generateLoaders('sass', {
            indentedSyntax: true
        }),
        scss: generateLoaders('sass'),
        stylus: generateLoaders('stylus'),
        styl: generateLoaders('stylus')
    };
}

// Generate loaders for standalone style files (outside of .vue)
export function styleLoaders(options) {
    let output = [];
    let loaders = cssLoaders(options);

    Object.keys(loaders).forEach(extension => {
        output.push({
            test: new RegExp(`\\.${extension}$`),
            use: loaders[extension],
            name: extension
        });
    });

    return output;
}
