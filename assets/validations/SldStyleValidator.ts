import { TestContext, ValidationError } from "yup";
import StyleValidator from "./StyleValidator";
import SldStyleParser from "geostyler-sld-parser";
import { Service, StyleFormat } from "../@types/app";

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

        const domParser = new DOMParser();
        const xmlDoc = domParser.parseFromString(styleString, "application/xml");
        const version = xmlDoc.getElementsByTagName("StyledLayerDescriptor")[0].attributes?.["version"]?.nodeValue ?? "";

        if (version === "") {
            return ctx.createError({ message: "sld_version_missing" });
        } else if (version !== "1.0.0") {
            return ctx.createError({ message: "sld_version_unaccepted" });
        }

        const sldParser = new SldStyleParser({ sldVersion: "1.0.0" });
        const result = await sldParser.readStyle(styleString);

        const { output, warnings, errors, unsupportedProperties } = result;

        if (errors) {
            const invalidXmlSyntax = !!errors.find((e) => e instanceof TypeError);

            if (invalidXmlSyntax) {
                return ctx.createError({ message: "xml_invalid" });
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
                return ctx.createError({ message: "field_name_invalid_or_unspecified" });
            }

            if (output.rules.length === 0) {
                return ctx.createError({ message: "no_style_declared" });
            }

            const rulesWithNoSymbolizers = output.rules.filter((rule) => rule.symbolizers.length === 0);
            if (rulesWithNoSymbolizers.length > 0) {
                return ctx.createError({ message: "rules_with_no_symbolizers" });
            }
        }

        return true;
    }
}
