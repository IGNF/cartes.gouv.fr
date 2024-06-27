import SldStyleParser from "geostyler-sld-parser";
import { TestContext, ValidationError } from "yup";
import { Service, StyleFormat } from "../@types/app";
import { getTranslation } from "../i18n/i18n";
import StyleValidator from "./StyleValidator";

const { t: tSld } = getTranslation("SldStyleValidationErrors");

export default class SldStyleValidator extends StyleValidator {
    constructor(service: Service, format: StyleFormat) {
        super(service, format);
    }

    async validate(files: FileList, ctx: TestContext): Promise<ValidationError | boolean> {
        const validation = await super.validate(files, ctx);
        if (validation instanceof ValidationError) {
            return validation;
        }

        const file = files[0];
        const styleString = await file.text();

        const sldParser = new SldStyleParser({ locale: "fr" });
        const result = await sldParser.readStyle(styleString);

        const { output, warnings, errors, unsupportedProperties } = result;

        if (errors) {
            const invalidXmlSyntax = !!errors.find((e) => e instanceof TypeError);

            if (invalidXmlSyntax) {
                return ctx.createError({ message: tSld("file_invalid") });
            } else {
                return ctx.createError({ message: tSld("geostyler_parse_error", { geostylerError: errors.map((e) => e.message).join(" ") }) });
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
