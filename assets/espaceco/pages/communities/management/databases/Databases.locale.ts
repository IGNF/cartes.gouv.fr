import { DBOption } from "@/@types/app_espaceco";
import { declareComponentKeys } from "@/i18n/i18n";
import { Translations } from "@/i18n/types";

// traductions
const { i18n } = declareComponentKeys<
    | "loading_databases"
    | "loading_permissions"
    | { K: "get_option"; P: { option: DBOption }; R: string }
    | { K: "get_option_hint"; P: { option: DBOption }; R: string }
>()("Databases");
export type I18n = typeof i18n;

export const DatabasesFrTranslations: Translations<"fr">["Databases"] = {
    loading_databases: "Chargement de la configuration des bases de données en cours ...",
    loading_permissions: "Chargement des permissions en cours ...",
    get_option: ({ option }) => {
        switch (option) {
            case "none":
                return "Ne pas ajouter de bases de données au guichet";
            case "add":
                return "Ajouter des bases de données dont vous êtes gestionnaire à partir de votre espace collaboratif";
            case "reuse":
                return "Ré-utiliser la configuration de bases de données d’un autre guichet dont vous êtes gestionnaire";
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
};

export const DatabasesEnTranslations: Translations<"en">["Databases"] = {
    loading_databases: undefined,
    loading_permissions: undefined,
    get_option: ({ option }) => `${option}`,
    get_option_hint: ({ option }) => `${option}`,
};
