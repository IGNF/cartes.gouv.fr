import { declareComponentKeys } from "i18nifty";
import { Translations } from "../i18n/i18n";

export const { i18n } = declareComponentKeys<
    | { K: "no_file_provided"; P: { tableName: string }; R: string }
    | { K: "unaccepted_extension"; P: { fileName: string }; R: string }
    | "file_invalid"
    | "field_name_invalid_or_unspecified"
    | { K: "field_name_does_not_correspond_table_name"; P: { fieldNameValue: string; tableName: string }; R: string }
    | "no_style_declared"
    | "file_missing_corrupted_or_reading_error"
    | { K: "rules_with_no_symbolizers"; P: { ruleNames: string[] }; R: string }
    | { K: "geostyler_parse_error"; P: { geostylerError: string }; R: string }
    | { K: "geostyler_unexpected_error"; P: { geostylerError: string }; R: string }
>()("SldStyleValidationErrors");

export const SldStyleValidationErrorsFrTranslations: Translations<"fr">["SldStyleValidationErrors"] = {
    no_file_provided: ({ tableName }) => `Veuillez fournir un fichier de style pour la table ${tableName}`,
    unaccepted_extension: ({ fileName }) => `L’extension du fichier de style ${fileName} n'est pas correcte. Seule l’extension sld est acceptée.`,
    file_invalid: "Ce fichier n'est pas un fichier de style valide. Erreur de syntaxe XML.",
    field_name_invalid_or_unspecified: "Le champ 'name' est invalide ou n'est pas spécifié.",
    field_name_does_not_correspond_table_name: ({ fieldNameValue, tableName }) =>
        `Le champ 'name' (${fieldNameValue}) ne correspond pas au nom de la table (${tableName}).`,
    no_style_declared: "Aucun style n'est déclaré.",
    file_missing_corrupted_or_reading_error: "Fichier manquant/corrompu ou erreur lors de la lecture.",
    rules_with_no_symbolizers: ({ ruleNames }) => {
        const plural = ruleNames.length % 2 === 0;
        return `${plural ? "Les règles" : "La règle"} [${ruleNames.map((ruleName) => `'${ruleName}'`).join(", ")}] ${
            plural ? "n'ont" : "n'a"
        } pas de symbolisation spécifiée.`;
    },
    geostyler_parse_error: ({ geostylerError }) => decodeHTMLEntities(geostylerError),
    geostyler_unexpected_error: ({ geostylerError }) => `Une erreur inattendue est survenue : ${geostylerError}`,
};

export const SldStyleValidationErrorsEnTranslations: Translations<"en">["SldStyleValidationErrors"] = {
    no_file_provided: undefined,
    unaccepted_extension: undefined,
    file_invalid: undefined,
    field_name_invalid_or_unspecified: undefined,
    field_name_does_not_correspond_table_name: undefined,
    no_style_declared: undefined,
    file_missing_corrupted_or_reading_error: undefined,
    rules_with_no_symbolizers: undefined,
    geostyler_parse_error: undefined,
    geostyler_unexpected_error: undefined,
};

const decodeHTMLEntities = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = text;
    return textArea.value;
};
