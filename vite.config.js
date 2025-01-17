import react from "@vitejs/plugin-react";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "process";
import { defineConfig } from "vite";
import run from "vite-plugin-run";
import symfonyPlugin from "vite-plugin-symfony";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
            exposedEnvVars: ["APP_ENV", "APP_ROOT_URL"],
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
                main: resolve(join(__dirname, "./assets", "main.tsx")),
                dsfr: resolve(join(__dirname, "./node_modules", "@codegouvfr", "react-dsfr", "main.css")),
            },
        },
    },
});
