import react from "@vitejs/plugin-react";
import { Unhead } from "@unhead/react/vite";
import autoprefixer from "autoprefixer";
import { join, resolve } from "path";
import { defineConfig } from "vite";
import run from "vite-plugin-run";
import symfonyPlugin from "vite-plugin-symfony";

// Renseignés par la CI (voir docker-build-publish.yml), vides en build local
const appVersion = process.env.APP_VERSION ?? "";
const appRevision = process.env.APP_REVISION ?? "";
// Invalide le cache react-query persisté à chaque révision ; en local, à chaque build
const cacheBuster = appRevision || `local-${Date.now()}`;

export default defineConfig({
    define: {
        __APP_VERSION__: JSON.stringify(appVersion),
        __APP_REVISION__: JSON.stringify(appRevision),
        __CACHE_BUSTER__: JSON.stringify(cacheBuster),
    },
    server: {
        // Required to listen on all interfaces
        host: "0.0.0.0",
        cors: true,
    },
    plugins: [
        react(),
        Unhead(),
        symfonyPlugin({
            viteDevServerHostname: "localhost",
            refresh: true,
            sriAlgorithm: "sha384",
            exposedEnvVars: ["APP_ENV"],
        }),
        run([
            {
                name: "fos-routing-js-dump",
                run: ["php", "bin/console", "fos:js-routing:dump", "--target", "./var/cache/fosRoutes.json", "--format", "json"],
                pattern: ["src/Controller/**.php"],
            },
        ]),
    ],
    base: "/build/",
    build: {
        emptyOutDir: true,
        outDir: resolve(join(__dirname, "public", "build")),
        cssMinify: "esbuild",
        rollupOptions: {
            input: {
                main: resolve(join(__dirname, "./assets", "main.tsx")),
                dsfr: resolve(join(__dirname, "./node_modules", "@codegouvfr", "react-dsfr", "main.css")),
            },
        },
    },
    resolve: {
        alias: {
            "@": resolve(join(__dirname, "assets")),
        },
    },
    css: {
        postcss: {
            plugins: [autoprefixer()],
        },
    },
});
