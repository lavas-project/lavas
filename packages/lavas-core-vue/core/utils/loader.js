/**
 * @file utils.loader.js
 * @author lavas
 */
import ExtractTextPlugin from 'extract-text-webpack-plugin';

export function vueLoaders(options = {}) {
    return {
        loaders: cssLoaders({
            cssSourceMap: options.cssSourceMap,
            cssMinimize: options.cssMinimize,
            cssExtract: options.cssExtract
        })
    };
}

export function cssLoaders(options = {}) {

    const cssLoader = {
        loader: 'css-loader',
        options: {
            minimize: options.cssMinimize,
            sourceMap: options.cssSourceMap
        }
    };

    const postcssLoader = {
        loader: 'postcss-loader',
        options: {
            sourceMap: options.cssSourceMap
        }
    };

    // generate loader string to be used with extract text plugin
    function generateLoaders(loader, loaderOptions) {
        let loaders = [cssLoader, postcssLoader];

        if (loader) {
            loaders.push({
                loader: loader + '-loader',
                options: Object.assign({}, loaderOptions, {
                    sourceMap: options.cssSourceMap
                })
            });
        }

        // Extract CSS when that option is specified
        // (which is the case during production build)
        if (options.cssExtract) {
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
