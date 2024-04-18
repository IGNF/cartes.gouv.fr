import { TestContext, ValidationError } from "yup";
import StyleValidator from "./StyleValidator";
import QGISStyleParser from "geostyler-qgis-parser";
import { Service, StyleFormat } from "../@types/app";

export default class QGisStyleValidator extends StyleValidator {
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

        const qgisParser = new QGISStyleParser();

        const result = await qgisParser.readStyle(styleString);

        const { warnings, errors, unsupportedProperties } = result;

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

        return true;
    }
}
