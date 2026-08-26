import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "assets"),
        },
    },
    test: {
        include: ["assets/**/*.test.{ts,tsx}"],
        environment: "node",
    },
});
