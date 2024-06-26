const Encore = require("@symfony/webpack-encore");
const FosRouting = require("./vendor/friendsofsymfony/jsrouting-bundle/Resources/webpack/FosRouting");

// Manually configure the runtime environment if not already configured yet by the "encore" command.
// It's useful when you use tools that rely on webpack.config.js file.
if (!Encore.isRuntimeEnvironmentConfigured()) {
    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || "dev");
}

var publicPath = "/build";

require("dotenv").config({
    path: "./.env.local",
});

if (process.env.ENCORE_PUBLIC_PATH != undefined && "" !== process.env.ENCORE_PUBLIC_PATH) {
    publicPath = process.env.ENCORE_PUBLIC_PATH;
}

Encore
    // directory where compiled assets will be stored
    .setOutputPath("public/build/")
    // public path used by the web server to access the output path
    .setPublicPath(publicPath)
    // only needed for CDN's or sub-directory deploy
    .setManifestKeyPrefix("build/")

    /*
     * ENTRY CONFIG
     *
     * Each entry will result in one JavaScript file (e.g. app.js)
     * and one CSS file (e.g. app.css) if your JavaScript imports CSS.
     */
    .addEntry("main", "./assets/main.tsx")

    .copyFiles([
        {
            from: "./assets/img",
            to: "img/[path][name].[ext]",
        },
        {
            from: "./assets/data/pdf",
            to: "pdf/[path][name].[ext]",
        },
    ])

    // enables the Symfony UX Stimulus bridge (used in assets/bootstrap.js)
    // .enableStimulusBridge("./assets/controllers.json")

    // When enabled, Webpack "splits" your files into smaller pieces for greater optimization.
    .splitEntryChunks()

    // will require an extra script tag for runtime.js
    // but, you probably want this, unless you're building a single-page app
    .enableSingleRuntimeChunk()

    /*
     * FEATURE CONFIG
     *
     * Enable & configure other features below. For a full
     * list of features, see:
     * https://symfony.com/doc/current/frontend.html#adding-more-features
     */
    .cleanupOutputBeforeBuild()
    .enableBuildNotifications()
    .enableSourceMaps(!Encore.isProduction())
    // enables hashed filenames (e.g. app.abc123.css)
    .enableVersioning(Encore.isProduction())

    // configure Babel
    // .configureBabel((config) => {
    //     config.plugins.push('@babel/a-babel-plugin');
    // })

    // enables and configure @babel/preset-env polyfills
    .configureBabelPresetEnv((config) => {
        config.useBuiltIns = "usage";
        config.corejs = "3.30";
    })

    // enables Sass/SCSS support
    .enableSassLoader()
    .enablePostCssLoader()

    .enableTypeScriptLoader()

    // uncomment if you use React
    .enableReactPreset()

    .addPlugin(new FosRouting())

    // uncomment to get integrity="..." attributes on your script & link tags
    // requires WebpackEncoreBundle 1.4 or higher
    .enableIntegrityHashes(Encore.isProduction());

// uncomment if you're having problems with a jQuery plugin
//.autoProvidejQuery()

module.exports = Encore.getWebpackConfig();
