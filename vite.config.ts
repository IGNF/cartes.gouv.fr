import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import { configDotenv } from "dotenv";
import { join, resolve } from "path";
import { defineConfig } from "vite";
import run from "vite-plugin-run";
import symfonyPlugin from "vite-plugin-symfony";

configDotenv({
    path: [resolve(__dirname, ".env.local")],
});

export default defineConfig({
    server: {
        // Required to listen on all interfaces
        host: "0.0.0.0",
        cors: true,
    },
    plugins: [
        react(), // if you're using React
        symfonyPlugin({
            viteDevServerHostname: "localhost",
            refresh: true,
            sriAlgorithm: "sha384",
            debug: process.env.APP_ENV === "dev",
            exposedEnvVars: ["APP_ENV", "APP_ROOT_URL", "CATALOGUE_URL", "API_ESPACE_COLLABORATIF_URL", "CONFIG_COMMUNITY_ID"],
        }),
        run([
            {
                name: "fos-routing-js-dump",
                run: ["php", "bin/console", "fos:js-routing:dump", "--target", "./var/cache/fosRoutes.json", "--format", "json"],
                pattern: ["src/Controller/**.php"],
            },
        ]),
    ],
    base: process.env.ENCORE_PUBLIC_PATH ?? "/build/",
    build: {
        outDir: resolve(join(__dirname, "public", "build")),
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
