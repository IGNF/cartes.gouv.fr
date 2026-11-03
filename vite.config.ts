import react from "@vitejs/plugin-react";
import { Unhead } from "@unhead/react/vite";
import autoprefixer from "autoprefixer";
import { join, resolve } from "path";
import { defineConfig, loadEnv } from "vite";
import run from "vite-plugin-run";
import symfonyPlugin from "vite-plugin-symfony";

export default defineConfig(({ mode }) => {
    // .env*, .env.local et variables du processus (build-args de la CI) ; seules les clés nommées ci-dessous vont dans le bundle
    const env = loadEnv(mode, import.meta.dirname, "");
    // Chemin de base de l’installation (alias Apache, ex. /cartes.gouv.fr), vide à la racine
    const basePath = (env.APP_BASE_PATH ?? "").replace(/\/+$/, "");
    // Renseignés par la CI (voir docker-build-publish.yml), vides en build local
    const appVersion = env.APP_VERSION ?? "";
    const appRevision = env.APP_REVISION ?? "";
    // Invalide le cache react-query persisté à chaque révision ; en local, à chaque build
    const cacheBuster = appRevision || `local-${Date.now()}`;

    return {
        base: `${basePath}/build/`,
        define: {
            "import.meta.env.APP_BASE_PATH": JSON.stringify(basePath),
            "import.meta.env.APP_VERSION": JSON.stringify(appVersion),
            "import.meta.env.APP_REVISION": JSON.stringify(appRevision),
            "import.meta.env.APP_CACHE_BUSTER": JSON.stringify(cacheBuster),
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
                // variables du build injectées ci-dessus, aucune en plus (défaut : APP_ENV, inutilisée)
                exposedEnvVars: [],
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
            outDir: resolve(join(import.meta.dirname, "public", "build")),
            cssMinify: "esbuild",
            rolldownOptions: {
                input: {
                    main: resolve(join(import.meta.dirname, "./assets", "main.tsx")),
                    dsfr: resolve(join(import.meta.dirname, "./node_modules", "@codegouvfr", "react-dsfr", "main.css")),
                },
            },
        },
        resolve: {
            alias: {
                "@": resolve(join(import.meta.dirname, "assets")),
            },
        },
        css: {
            postcss: {
                plugins: [autoprefixer()],
            },
        },
    };
});
