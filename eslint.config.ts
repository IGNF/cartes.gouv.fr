import js from "@eslint/js";
// Désactive les règles stylistiques susceptibles de confliter avec Prettier (on laisse Prettier faire le formatage)
import prettier from "eslint-config-prettier";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
    globalIgnores([
        // Dossiers générés / externes ignorés par le lint
        "public/build",
        "public/bundles",
        "assets/data",
        "vendor",
        "var",
    ]),
    // Config de base pour tous les fichiers (plugins, globals, règles génériques)
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        settings: { react: { version: "detect" } },
        plugins: { js, pluginReact, reactHooks, tseslint },
        extends: ["js/recommended"],
        languageOptions: { globals: { ...globals.browser, ...globals.node } },
        rules: {
            // Cohérence logique
            eqeqeq: "warn",
            "array-callback-return": "error",
            // Placeholders autorisés via underscore
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
        },
    },
    // Surcharge de règles spécifique aux fichiers de traduction i18n (fichiers *.locale.ts/tsx)
    // Permet les identifiants i18n utilisés uniquement pour le typage et les arguments préfixés par un underscore
    {
        files: ["**/*.locale.ts", "**/*.locale.tsx"],
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    varsIgnorePattern: "^i18n$",
                    argsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
        },
    },
    tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    pluginReact.configs.flat["jsx-runtime"],
    reactHooks.configs.flat.recommended,
    reactRefresh.configs.recommended,
    prettier,

    // Enfin, une dernière couche de règles pour tout le projet
    // TODO : les régles désactivées (off) ci-dessous engendrent aujourd'hui beaucoup d'erreurs mais fonctionnellement ne posent pas de souci. Elles doivent être reactivées une par une après revue.
    {
        rules: {
            "react/hook-use-state": "error",
            "react-hooks/preserve-manual-memoization": "off",
            "react-hooks/incompatible-library": "off",
            "react-hooks/use-memo": "off",
            "react-hooks/set-state-in-effect": "off",
            "react-refresh/only-export-components": "off",
        },
    },
]);
