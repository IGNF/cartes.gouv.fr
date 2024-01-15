import { TestContext, ValidationError } from "yup";
import StyleValidator from "./StyleValidator";
import QGISStyleParser from "geostyler-qgis-parser";
import { Service, StyleFormat } from "../types/app";

export default class QGisStyleValidator extends StyleValidator {
    constructor(service: Service, format: StyleFormat) {
        super(service, format);
    }

    async validate(layerName: string | undefined, files: FileList, ctx: TestContext): Promise<ValidationError | boolean> {
        const validation = await super.validate(layerName, files, ctx);
        if (validation instanceof ValidationError) {
            return validation;
        }

        const file = files[0];
        const styleString = await file.text();

        const qgisParser = new QGISStyleParser();

        const result = await qgisParser.readStyle(styleString);

        // TODO FAIRE L'ANALYSE
        // const { output, warnings, errors, unsupportedProperties } = result;
        console.log(result);

        return true;
    }
}
