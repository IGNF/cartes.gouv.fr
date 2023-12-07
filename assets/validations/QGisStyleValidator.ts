import { TestContext, ValidationError } from "yup";
import { FileFormat, StyleValidator } from "./StyleValidator";
import QGISStyleParser from "geostyler-qgis-parser";

export default class QGisStyleValidator extends StyleValidator {
    constructor(format: FileFormat) {
        super(format);
    }

    async validate(layerName: string, files: FileList, ctx: TestContext): Promise<ValidationError | boolean> {
        const validation = await super.validate(layerName, files, ctx);
        if (validation instanceof ValidationError) {
            return validation;
        }

        const file = files[0];
        const styleString = await file.text();

        const qgisParser = new QGISStyleParser();

        const result = await qgisParser.readStyle(styleString);
        // const { output, warnings, errors, unsupportedProperties } = result;
        console.log(result);

        return true;
    }
}
