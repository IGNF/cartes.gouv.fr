import SldStyleParser from "geostyler-sld-parser";
import { declareComponentKeys } from "i18nifty";
import { TestContext } from "yup";

import { Translations, getTranslation } from "../i18n/i18n";
import { getFileExtension } from "../utils";

const { t: tSld } = getTranslation("sldStyleValidation");

export default class SldStyleWmsVectorValidator {
    /**
     * - applique la condition "exists" que si offering n'est pas undefined (on est en mode édition)
     * - applique la condition "isValid" si "exists" est true
     */
    async validate(tableName: string, value: FileList, ctx: TestContext, offeringId: string | undefined) {
        const exists = this.#exists(tableName, value as FileList, ctx);
        const isValid = await this.#isValid(tableName, value as FileList, ctx);

        if (offeringId !== undefined) {
            if (exists === true) {
                return isValid;
            }
        } else {
            if (exists !== true) {
                return exists;
            }
            return isValid;
        }

        return true;
    }

    #exists(tableName: string, value: FileList, ctx: TestContext) {
        if (value instanceof FileList && value.length === 0) {
            return ctx.createError({ message: tSld("no_file_provided", { tableName }) });
        }

        return true;
    }

    async #isValid(tableName: string, value: FileList, ctx: TestContext) {
        const file = value?.[0] ?? undefined;

        /**
         * // TODO : il manque la validation des contraintes suivantes :
         * - type de symbologie (symbolizer) doit correspondre au type de geometrie
         */
        if (file instanceof File) {
            if (getFileExtension(file.name)?.toLowerCase() !== "sld") {
                return ctx.createError({ message: tSld("unaccepted_extension", { fileName: file.name }) });
            }

            const styleString = await file.text();

            const domParser = new DOMParser();
            const xmlDoc: XMLDocument = domParser.parseFromString(styleString, "application/xml");

            if (xmlDoc.getElementsByTagName("StyledLayerDescriptor").length === 0) {
                return ctx.createError({ message: tSld("file_invalid") });
            }

            const version = xmlDoc.getElementsByTagName("StyledLayerDescriptor")[0].attributes?.["version"]?.nodeValue ?? "";

            if (version === "") {
                return ctx.createError({ message: tSld("sld_version_missing") });
            } else if (version !== "1.0.0") {
                return ctx.createError({ message: tSld("sld_version_unaccepted") });
            }

            const sldParser = new SldStyleParser({ sldVersion: "1.0.0" });
            const result = await sldParser.readStyle(styleString);

            const { output, warnings, errors, unsupportedProperties } = result;

            if (errors) {
                const invalidXmlSyntax = !!errors.find((e) => e instanceof TypeError);

                if (invalidXmlSyntax) {
                    return ctx.createError({ message: tSld("file_invalid") });
                } else {
                    return ctx.createError({ message: JSON.stringify(errors) });
                }
            }

            if (unsupportedProperties) {
                return ctx.createError({ message: JSON.stringify(unsupportedProperties) });
            }

            if (warnings) {
                return ctx.createError({ message: JSON.stringify(warnings) });
            }

            if (output) {
                if (output?.name === "") {
                    return ctx.createError({ message: tSld("field_name_invalid_or_unspecified") });
                }

                if (output.name !== tableName) {
                    return ctx.createError({ message: tSld("field_name_does_not_correspond_table_name", { fieldNameValue: output.name, tableName }) });
                }

                if (output.rules.length === 0) {
                    return ctx.createError({ message: tSld("no_style_declared") });
                }

                const rulesWithNoSymbolizers = output.rules.filter((rule) => rule.symbolizers.length === 0);
                if (rulesWithNoSymbolizers.length > 0) {
                    return ctx.createError({ message: tSld("rules_with_no_symbolizers", { ruleNames: rulesWithNoSymbolizers.map((rule) => rule.name) }) });
                }
            }
        } else {
            return ctx.createError({ message: tSld("file_missing_corrupted_or_reading_error") });
        }

        return true;
    }
}

export const { i18n } = declareComponentKeys<
    | { K: "no_file_provided"; P: { tableName: string }; R: string }
    | { K: "unaccepted_extension"; P: { fileName: string }; R: string }
    | "sld_version_missing"
    | "sld_version_unaccepted"
    | "file_invalid"
    | "field_name_invalid_or_unspecified"
    | { K: "field_name_does_not_correspond_table_name"; P: { fieldNameValue: string; tableName: string }; R: string }
    | "no_style_declared"
    | "file_missing_corrupted_or_reading_error"
    | { K: "rules_with_no_symbolizers"; P: { ruleNames: string[] }; R: string }
>()("sldStyleValidation");

export const sldStyleValidationFrTranslations: Translations<"fr">["sldStyleValidation"] = {
    no_file_provided: ({ tableName }) => `Veuillez fournir un fichier de style pour la table ${tableName}`,
    unaccepted_extension: ({ fileName }) => `L'extension du fichier de style ${fileName} n'est pas correcte. Seule l'extension sld est acceptée.`,
    sld_version_missing: "La version de SLD n'est pas spécifiée.",
    sld_version_unaccepted: "Seule la version 1.0.0 de SLD est acceptée.",
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
};

export const sldStyleValidationEnTranslations: Translations<"en">["sldStyleValidation"] = {
    no_file_provided: undefined,
    unaccepted_extension: undefined,
    sld_version_missing: undefined,
    sld_version_unaccepted: undefined,
    file_invalid: undefined,
    field_name_invalid_or_unspecified: undefined,
    field_name_does_not_correspond_table_name: undefined,
    no_style_declared: undefined,
    file_missing_corrupted_or_reading_error: undefined,
    rules_with_no_symbolizers: undefined,
};
