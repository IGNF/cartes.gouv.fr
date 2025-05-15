import { DBOption } from "@/@types/app_espaceco";
import { PermissionLevel } from "@/@types/espaceco";
import { declareComponentKeys } from "@/i18n/i18n";
import { Translations } from "@/i18n/types";

// traductions
const { i18n } = declareComponentKeys<
    | "no_permissions"
    | "databases"
    | "no_databases"
    | "tables"
    | "no_tables"
    | "columns"
    | "no_columns"
    | "permission"
    | "add_database_permission"
    | "add_table_permission"
    | "add_column_permission"
    | "all_tables_have_permissions"
    | "all_columns_have_permissions"
    | { K: "loading_database"; P: { title: string }; R: string }
    | { K: "loading_table"; P: { title: string }; R: string }
    | "loading_permissions"
    | "update_permissions"
    | { K: "get_option"; P: { option: DBOption }; R: string }
    | { K: "get_option_hint"; P: { option: DBOption }; R: string }
    | "search.default_label"
    | "search.default_placeholder"
    | "search.no_options"
    | "search.loading"
    | { K: "get_level"; P: { level: PermissionLevel }; R: string }
    | "dialog.add_database_permission.title"
    | { K: "dialog.add_table_permission.title"; P: { dbTitle: string }; R: string }
    | { K: "dialog.add_column_permission.title"; P: { tableTitle: string }; R: string }
    | "select_table_items"
    | "select_column_items"
>()("Databases");
export type I18n = typeof i18n;

export const DatabasesFrTranslations: Translations<"fr">["Databases"] = {
    no_permissions: "Aucune permission",
    databases: "Permissions sur les bases de données",
    no_databases: "Aucune permission sur les bases de données",
    tables: "Permissions sur les tables",
    no_tables: "Aucune permission sur les tables",
    columns: "Permissions sur les colonnes",
    no_columns: "Aucune permission sur les colonnes",
    permission: "Permission",
    add_database_permission: "Ajouter une permission sur une base de données",
    add_table_permission: "Ajouter une permission sur une table",
    add_column_permission: "Ajouter une permission sur une colonne",
    all_tables_have_permissions: "Toutes les tables ont une permission",
    all_columns_have_permissions: "Toutes les colonnes ont une permission",
    loading_database: ({ title }) => `Récupération des tables de la base de données ${title}`,
    loading_table: ({ title }) => `Récupération des colonnes de la table ${title}`,
    loading_permissions: "Chargement des permissions en cours ...",
    update_permissions: "Mise à jour des permissions en cours ...",
    get_option: ({ option }) => {
        switch (option) {
            case "none":
                return "Ne pas ajouter de bases de données au guichet";
            case "add":
                return "Ajouter des bases de données dont vous êtes gestionnaire à partir de votre espace collaboratif";
            case "reuse":
                return "Réutiliser la configuration de bases de données d’un autre guichet dont vous êtes gestionnaire";
            case "import":
                return "Importer des nouvelles bases de données à votre espace collaboratif";
        }
    },
    get_option_hint: ({ option }) => {
        switch (option) {
            case "none":
                return "Je passe directement à l'étape suivante";
            case "add":
                return "Vous devrez paramétrer les droits d’accès des bases de données choisies";
            case "reuse":
                return "Toutes les permissions du guichet choisit seront recopiées ici et pourront être modifiées";
            case "import":
                return "Une fois ces nouvelles bases de données importées à votre espace collaboratif vous pourrez les ajouter à votre guichet. Vous devrez sortir de la création du guichet pour ajouter ces nouvelles bases. Le guichet sera sauvegardé comme non publié.";
        }
    },
    "search.default_label": "Base de données",
    "search.default_placeholder": "Recherche de la base de données par son intitulé (title)",
    "search.no_options": "Aucune base",
    "search.loading": "Recherche en cours ...",
    get_level: ({ level }) => {
        switch (level) {
            case "NONE":
                return "Aucune";
            case "VIEW":
                return "Lecture";
            case "EDIT":
                return "Ecriture";
        }
    },
    "dialog.add_database_permission.title": "Ajouter une permission à une base de données",
    "dialog.add_table_permission.title": ({ dbTitle }) => `Ajouter une permission à une table de la base de données ${dbTitle}`,
    "dialog.add_column_permission.title": ({ tableTitle }) => `Ajouter une permission à une colonne de la table ${tableTitle}`,
    select_table_items: "Sélectionner une table",
    select_column_items: "Sélectionner une colonne",
};

export const DatabasesEnTranslations: Translations<"en">["Databases"] = {
    no_permissions: "No permission",
    databases: undefined,
    no_databases: undefined,
    tables: undefined,
    no_tables: undefined,
    columns: undefined,
    no_columns: undefined,
    permission: "Permission",
    add_database_permission: undefined,
    add_table_permission: undefined,
    add_column_permission: undefined,
    all_tables_have_permissions: undefined,
    all_columns_have_permissions: undefined,
    loading_database: ({ title }) => `Loading database ${title}`,
    loading_table: ({ title }) => `Loading table ${title}`,
    loading_permissions: undefined,
    update_permissions: undefined,
    get_option: ({ option }) => `${option}`,
    get_option_hint: ({ option }) => `${option}`,
    "search.default_label": undefined,
    "search.default_placeholder": undefined,
    "search.no_options": undefined,
    "search.loading": undefined,
    get_level: ({ level }) => {
        return `${level}`;
    },
    "dialog.add_database_permission.title": undefined,
    "dialog.add_table_permission.title": ({ dbTitle }) => `TODO ${dbTitle}`,
    "dialog.add_column_permission.title": ({ tableTitle }) => `TODO ${tableTitle}`,
    select_table_items: "Sélectionner une table",
    select_column_items: "Sélectionner une colonne",
};
