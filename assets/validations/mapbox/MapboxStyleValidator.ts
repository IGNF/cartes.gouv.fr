import MapboxParser from "geostyler-mapbox-parser";
import { TestContext, ValidationError } from "yup";
import { Service, StyleFormat } from "../../@types/app";
import { getTranslation } from "../../i18n/i18n";
import getWebService from "../../modules/WebServices/WebServices";
import StyleValidator from "../StyleValidator";

const { t: tMapbox } = getTranslation("mapboxStyleValidation");

export default class MapboxStyleValidator extends StyleValidator {
    #layerNames: string[];

    constructor(service: Service, format: StyleFormat) {
        super(service, format);
        this.#layerNames = getWebService(service).getLayerNames();
    }

    async validate(value: string | undefined, ctx: TestContext): Promise<ValidationError | boolean> {
        const validation = await super.validate(value, ctx);
        if (validation instanceof ValidationError) {
            return validation;
        }

        let mapboxStyle;
        try {
            mapboxStyle = JSON.parse(value as string);
        } catch (e) {
            const error = e as SyntaxError;
            return ctx.createError({ message: error.message });
        }

        try {
            // S'assurer qu'il n'y a qu'un seule source de donnees
            let sourceName;
            if (!("sources" in mapboxStyle)) {
                throw new Error(tMapbox("no_source"));
            } else {
                const numSources = Object.keys(mapboxStyle.sources).length;
                if (1 !== numSources) {
                    throw new Error(tMapbox("only_one_source"));
                }
                sourceName = Object.keys(mapboxStyle.sources)[0];
            }

            // Les layers doivent avoir la meme source et leur nom doit etre dans #layerNames
            this.#checkLayers(sourceName, mapboxStyle.layers);

            const mbParser = new MapboxParser();
            const result = await mbParser.readStyle(mapboxStyle);

            const { warnings, errors, unsupportedProperties } = result;
            if (errors) {
                throw new Error(JSON.stringify(errors));
            }

            if (unsupportedProperties) {
                throw new Error(JSON.stringify(unsupportedProperties));
            }

            if (warnings) {
                throw new Error(JSON.stringify(warnings));
            }
        } catch (e) {
            const error = e as Error;
            return ctx.createError({ message: error.message });
        }

        return true;
    }

    #checkLayers(sourceName: string, layers: []) {
        for (let i = 0; i < layers.length; ++i) {
            const layer = layers[i];

            // Verification des proprietes de Layer
            if (!("source" in layer)) {
                throw new Error(tMapbox("source_is_missing"));
            }
            if (!("source-layer" in layer)) {
                throw new Error(tMapbox("source_layer_is_missing"));
            }

            if (layer["source"] !== sourceName) {
                throw new Error(tMapbox("incorrect_source", { layer: layer["source-layer"], source: sourceName }));
            }
            if (!this.#layerNames.includes(layer["source-layer"])) {
                throw new Error(tMapbox("source_layer_not_matching", { layer: layer["source-layer"] }));
            }
        }
    }
}
