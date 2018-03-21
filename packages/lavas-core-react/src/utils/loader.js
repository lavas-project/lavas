/**
 * @file utils.loader.js
 * @author lavas
 */
import ExtractTextPlugin from 'extract-text-webpack-plugin';

export function cssLoaders(options = {}) {

    let cssLoader = {
        loader: 'css-loader',
        options: {
            minimize: options.cssMinimize,
            sourceMap: options.cssSourceMap,
            modules: true,
            importLoaders: 1
            // localIdentName: '[path]___[name]__[local]___[hash:base64:5]'
        }
    };

    // generate loader string to be used with extract text plugin
    function generateLoaders(loader, loaderOptions) {
        let loaders = [cssLoader];

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
                fallback: 'style-loader'
            });
        }

        return ['style-loader', ...loaders];
    }

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

// Generate loaders for standalone style files (outside of .jsx|.js)
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
