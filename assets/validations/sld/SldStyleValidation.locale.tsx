import { declareComponentKeys } from "i18nifty/declareComponentKeys";
import { Translations } from "../../i18n/types";

const { i18n } = declareComponentKeys<
    | { K: "unaccepted_extension"; P: { fileName: string }; R: string }
    | "file_invalid"
    | "field_name_invalid_or_unspecified"
    | "no_style_declared"
    | "file_missing_corrupted_or_reading_error"
    | { K: "rules_with_no_symbolizers"; P: { ruleNames: string[] }; R: string }
    | { K: "geostyler_parse_error"; P: { geostylerError: string }; R: string }
>()("SldStyleValidationErrors");
export type I18n = typeof i18n;

export const SldStyleValidationErrorsFrTranslations: Translations<"fr">["SldStyleValidationErrors"] = {
    unaccepted_extension: ({ fileName }) => `L’extension du fichier de style ${fileName} n'est pas correcte. Seule l’extension sld est acceptée.`,
    file_invalid: "Ce fichier n'est pas un fichier de style valide. Erreur de syntaxe XML.",
    field_name_invalid_or_unspecified: "Le champ 'name' est invalide ou n'est pas spécifié.",
    no_style_declared: "Aucun style n'est déclaré.",
    file_missing_corrupted_or_reading_error: "Fichier manquant/corrompu ou erreur lors de la lecture.",
    rules_with_no_symbolizers: ({ ruleNames }) => {
        const plural = ruleNames.length % 2 === 0;
        return `${plural ? "Les règles" : "La règle"} [${ruleNames.map((ruleName) => `'${ruleName}'`).join(", ")}] ${
            plural ? "n'ont" : "n'a"
        } pas de symbolisation spécifiée.`;
    },
    geostyler_parse_error: ({ geostylerError }) => decodeHTMLEntities(geostylerError),
};

export const SldStyleValidationErrorsEnTranslations: Translations<"en">["SldStyleValidationErrors"] = {
    unaccepted_extension: undefined,
    file_invalid: undefined,
    field_name_invalid_or_unspecified: undefined,
    no_style_declared: undefined,
    file_missing_corrupted_or_reading_error: undefined,
    rules_with_no_symbolizers: undefined,
    geostyler_parse_error: undefined,
};

const decodeHTMLEntities = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = text;
    return textArea.value;
};
