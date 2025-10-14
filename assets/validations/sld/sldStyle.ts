import SldStyleParser from "geostyler-sld-parser";
import { TestContext } from "yup";

import { getTranslation } from "../../i18n/i18n";

const { t: tSld } = getTranslation("SldStyleValidationErrors");

export default class SldStyleWmsVectorValidator {
    /**
     * - Si mode création, les 2 conditions sont appliquées
     * - Si mode édition, la condition "exists" est appliquée pour une nouvelle table qui n'était pas déjà présente dans la configuration. Et la condition "isValid" est appliquée si "exists" est true
     *
     * En gros, un fichier de style pour toutes les tables est obligatoire en mode création. En édition, le fichier de style est obligatoire seulement pour une nouvelle table.
     */
    async validate(tableName: string, value: string | undefined, ctx: TestContext /*, offering: Service | undefined | null*/) {
        return await this.#isValid(tableName, value!, ctx);

        // const exists = this.#exists(tableName, value, ctx);
        // const isValid = exists && (await this.#isValid(tableName, value!, ctx));

        // const typeInfos = offering?.configuration?.type_infos as ConfigurationWmsVectorDetailsContent | undefined;
        // const oldTables = typeInfos?.used_data[0].relations.map((rel) => rel.name);

        // if (oldTables?.includes(tableName)) {
        //     if (exists === true) {
        //         return isValid;
        //     }
        // } else {
        //     if (exists !== true) {
        //         return exists;
        //     }
        //     return isValid;
        // }

        // return true;
    }

    // #exists(tableName: string, value: string | undefined, ctx: TestContext) {
    //     if (typeof value !== "string" || !value) {
    //         return ctx.createError({ message: tSld("no_file_provided", { tableName }) });
    //     }

    //     return true;
    // }

    async #isValid(tableName: string, value: string, ctx: TestContext) {
        if (!value) {
            return ctx.createError({ message: tSld("no_style_declared") });
        }

        const sldParser = new SldStyleParser({ locale: "fr" });
        const result = await sldParser.readStyle(value);

        const { output, warnings, errors, unsupportedProperties } = result;

        if (errors) {
            const invalidXmlSyntax = !!errors.find((e) => e instanceof TypeError);

            if (invalidXmlSyntax) {
                return ctx.createError({ message: tSld("file_invalid") });
            } else {
                try {
                    return ctx.createError({ message: tSld("geostyler_parse_error", { geostylerError: errors.map((e) => e.message).join(" ") }) });
                } catch (e) {
                    console.error(errors, e);

                    return ctx.createError({ message: tSld("geostyler_unexpected_error", { geostylerError: JSON.stringify(errors) }) });
                }
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

        return true;
    }
}
