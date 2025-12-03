import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import { execSync } from "child_process";
import { configDotenv } from "dotenv";
import { join, resolve } from "path";
import { defineConfig } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import run from "vite-plugin-run";
import symfonyPlugin from "vite-plugin-symfony";

configDotenv({
    path: [resolve(__dirname, ".env.local")],
});

function getGitInfo() {
    try {
        const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
        const tag = execSync("git describe --tags --abbrev=0").toString().trim();
        const commit = execSync("git rev-parse --short HEAD").toString().trim();
        return { branch, tag, commit };
    } catch (error) {
        console.error("Failed to get Git info", error);
        throw error;
    }
}

const gitInfo = getGitInfo();

export default defineConfig({
    define: {
        __GIT_TAG__: JSON.stringify(gitInfo?.tag),
        __GIT_COMMIT__: JSON.stringify(gitInfo?.commit),
    },
    server: {
        // Required to listen on all interfaces
        host: "0.0.0.0",
        cors: true,
    },
    plugins: [
        react(),
        symfonyPlugin({
            viteDevServerHostname: "localhost",
            refresh: true,
            sriAlgorithm: "sha384",
            debug: process.env.APP_ENV === "dev",
            exposedEnvVars: ["APP_ENV"],
        }),
        ViteImageOptimizer(),
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
        emptyOutDir: true,
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
