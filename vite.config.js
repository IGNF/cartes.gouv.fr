import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import run from "vite-plugin-run";
import { viteStaticCopy } from "vite-plugin-static-copy";
import symfonyPlugin from "vite-plugin-symfony";

// {
//     from: "./assets/img",
//     to: "img/[path][name][ext]",
// },
// {
//     from: "./assets/data/pdf",
//     to: "pdf/[path][name][ext]",
// },
// {
//     from: "./node_modules/@codegouvfr/react-dsfr/favicon",
//     to: "react-dsfr/favicon/[name].[contenthash][ext]",
// },
// {
//     from: "./node_modules/@codegouvfr/react-dsfr/dsfr/dsfr.min.css",
//     to: "react-dsfr/dsfr/[name].[contenthash][ext]",
// },
// {
//     from: "./node_modules/@codegouvfr/react-dsfr/dsfr/utility/icons/icons.min.css",
//     to: "react-dsfr/dsfr/utility/icons/[name].[contenthash][ext]",
// },
// {
//     from: "./node_modules/@codegouvfr/react-dsfr/dsfr/fonts",
//     to: "react-dsfr/dsfr/fonts/[path][name][ext]",
// },
// {
//     from: "./node_modules/@codegouvfr/react-dsfr/dsfr/icons",
//     to: "react-dsfr/dsfr/icons/[path][name][ext]",
// },

export default defineConfig({
    server: {
        // Required to listen on all interfaces
        host: "0.0.0.0",
    },
    plugins: [
        react(), // if you're using React
        symfonyPlugin({
            viteDevServerHostname: "localhost",
        }),
        viteStaticCopy({
            targets: [
                {
                    src: "./assets/img",
                    to: "img",
                },
            ],
        }),
        run([
            {
                name: "fos-routing-js-dump",
                run: ["php", "bin/console", "fos:js-routing:dump", "--target", "./var/cache/fosRoutes.json", "--format", "json"],
                pattern: ["src/Controller/**.php"],
            },
        ]),
    ],
    build: {
        rollupOptions: {
            input: {
                main: "./assets/main.tsx",
            },
        },
    },
});
