import { TestContext, ValidationError } from "yup";
import StyleValidator from "./StyleValidator";
import MapboxParser from "geostyler-mapbox-parser";
import { Service, StyleFormat } from "../types/app";

export default class MapboxStyleValidator extends StyleValidator {
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
        const mapboxStyle = JSON.parse(styleString) as mapboxgl.Style;

        const mbParser = new MapboxParser();

        const result = await mbParser.readStyle(mapboxStyle);

        // TODO FAIRE L'ANALYSE
        // const { output, warnings, errors, unsupportedProperties } = result;
        console.log(result);

        return true;
    }
}
