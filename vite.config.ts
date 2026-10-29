import react from "@vitejs/plugin-react";
import { Unhead } from "@unhead/react/vite";
import autoprefixer from "autoprefixer";
import { join, resolve } from "path";
import { defineConfig, loadEnv } from "vite";
import run from "vite-plugin-run";
import symfonyPlugin from "vite-plugin-symfony";

// Renseignés par la CI (voir docker-build-publish.yml), vides en build local
const appVersion = process.env.APP_VERSION ?? "";
const appRevision = process.env.APP_REVISION ?? "";
// Invalide le cache react-query persisté à chaque révision ; en local, à chaque build
const cacheBuster = appRevision || `local-${Date.now()}`;

export default defineConfig(({ mode }) => {
    // Chemin de base de l’installation (alias Apache, ex. /cartes.gouv.fr), vide à la racine ; lu dans .env/.env.local
    const basePath = (loadEnv(mode, __dirname, "").APP_BASE_PATH ?? "").replace(/\/+$/, "");

    return {
        base: `${basePath}/build/`,
        define: {
            "import.meta.env.APP_BASE_PATH": JSON.stringify(basePath),
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
            // Régénère le fichier de routes commité (assets/modules/symfony-routes.json) en dev seulement : le build n’a pas besoin de PHP
            run([
                {
                    name: "symfony-routes-dump",
                    run: ["composer", "symfony-routing-dump"],
                    pattern: ["src/Controller/**.php"],
                    build: false,
                },
            ]),
        ],
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
    };
});
