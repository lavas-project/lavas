export function syncConfig(lavasCore, config) {
    lavasCore.config = config;
    lavasCore.builder.config = config;
    lavasCore.builder.webpackConfig.config = config;
}
