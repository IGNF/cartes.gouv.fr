import js from "@eslint/js";
import pluginQuery from "@tanstack/eslint-plugin-query";
import prettier from "eslint-config-prettier";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tssUnusedClasses from "eslint-plugin-tss-unused-classes";

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
        ...jsxA11y.flatConfigs.recommended,
        settings: { react: { version: "detect" } },
        plugins: { js, pluginReact, reactHooks, tseslint, "tss-unused-classes": tssUnusedClasses },
        extends: ["js/recommended"],
        languageOptions: {
            ...jsxA11y.flatConfigs.recommended.languageOptions,
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            // Cohérence logique
            eqeqeq: "warn",
            "array-callback-return": "error",
            // Placeholders autorisés via underscore
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
            "tss-unused-classes/unused-classes": "warn",
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
    // TODO Activer l'analyse typée pour TypeScript: nécessaire pour recommendedTypeChecked
    // {
    //     files: ["**/*.ts", "**/*.tsx"],
    //     languageOptions: {
    //         parser: tseslint.parser,
    //         parserOptions: {
    //             // Utilise automatiquement les tsconfig.* (monorepo-friendly)
    //             projectService: true,
    //             tsconfigRootDir: import.meta.dirname,
    //         },
    //     },
    // },
    // tseslint.configs.recommendedTypeChecked,
    tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    pluginReact.configs.flat["jsx-runtime"],
    reactHooks.configs.flat.recommended,
    reactRefresh.configs.recommended,
    ...pluginQuery.configs["flat/recommended"],
    jsxA11y.flatConfigs.strict,
    prettier,

    // Enfin, une dernière couche de règles pour tout le projet
    // TODO : les régles désactivées (off) ci-dessous engendrent aujourd'hui beaucoup d'erreurs mais fonctionnellement ne posent pas de souci. Elles doivent être reactivées une par une après revue.
    {
        rules: {
            "react/hook-use-state": "error",
            "react-hooks/set-state-in-effect": "off",
            "react-refresh/only-export-components": "off",
            "react-hooks/preserve-manual-memoization": "off",
            "react-hooks/incompatible-library": "off",
        },
    },
]);
