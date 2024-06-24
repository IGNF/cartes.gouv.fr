import SldStyleParser from "geostyler-sld-parser";
import { TestContext } from "yup";

import { Service } from "../@types/app";
import { getTranslation } from "../i18n/i18n";
import { getFileExtension } from "../utils";
import { ConfigurationWmsVectorDetailsContent } from "../@types/entrepot";
import { SLD_ACCEPTED_VERSIONS } from "./SldStyleValidationErrorsTr";

const { t: tSld } = getTranslation("SldStyleValidationErrors");

export default class SldStyleWmsVectorValidator {
    /**
     * - Si mode création, les 2 conditions sont appliquées
     * - Si mode édition, la condition "exists" est appliquée pour une nouvelle table qui n'était pas déjà présente dans la configuration. Et la condition "isValid" est appliquée si "exists" est true
     *
     * En gros, un fichier de style pour toutes les tables est obligatoire en mode création. En édition, le fichier de style est obligatoire seulement pour une nouvelle table.
     */
    async validate(tableName: string, value: FileList, ctx: TestContext, offering: Service | undefined | null) {
        const exists = this.#exists(tableName, value as FileList, ctx);
        const isValid = await this.#isValid(tableName, value as FileList, ctx);

        const typeInfos = offering?.configuration?.type_infos as ConfigurationWmsVectorDetailsContent | undefined;
        const oldTables = typeInfos?.used_data[0].relations.map((rel) => rel.name);

        if (oldTables?.includes(tableName)) {
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
            } else if (!SLD_ACCEPTED_VERSIONS.includes(version)) {
                return ctx.createError({ message: tSld("sld_version_unaccepted", { version }) });
            }

            const sldParser = new SldStyleParser({ sldVersion: version, locale: "fr" });
            const result = await sldParser.readStyle(styleString);

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
        } else {
            return ctx.createError({ message: tSld("file_missing_corrupted_or_reading_error") });
        }

        return true;
    }
}
