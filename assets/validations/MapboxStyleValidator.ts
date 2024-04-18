import { TestContext, ValidationError } from "yup";
import StyleValidator from "./StyleValidator";
import MapboxParser from "geostyler-mapbox-parser";
import getWebService from "../modules/WebServices/WebServices";
import { Service, StyleFormat } from "../@types/app";
import { declareComponentKeys } from "i18nifty";
import { Translations, getTranslation } from "../i18n/i18n";

const { t: tMapbox } = getTranslation("mapboxStyleValidation");

export default class MapboxStyleValidator extends StyleValidator {
    #layerNames: string[];

    constructor(service: Service, format: StyleFormat) {
        super(service, format);
        this.#layerNames = getWebService(service).getLayerNames();
    }

    async validate(files: FileList, ctx: TestContext): Promise<ValidationError | boolean> {
        const validation = await super.validate(files, ctx);
        if (validation instanceof ValidationError) {
            return validation;
        }

        const file = files[0];
        const styleString = await file.text();

        let mapboxStyle;
        try {
            mapboxStyle = JSON.parse(styleString);
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

export const { i18n } = declareComponentKeys<
    | "no_source"
    | "only_one_source"
    | "source_is_missing"
    | "source_layer_is_missing"
    | { K: "source_layer_not_matching"; P: { layer: string }; R: string }
    | { K: "incorrect_source"; P: { layer: string; source: string }; R: string }
>()("mapboxStyleValidation");

export const mapboxStyleValidationFrTranslations: Translations<"fr">["mapboxStyleValidation"] = {
    no_source: "Il n'y a aucune source de données",
    only_one_source: "Il ne doit y avoir qu'une seule source de données",
    source_is_missing: "Layer: la source est obligatoire",
    source_layer_is_missing: "Layer : source-layer est obligatoire",
    source_layer_not_matching: ({ layer }) => `source-layer [${layer}] ne correspond à aucun layer du service`,
    incorrect_source: ({ layer, source }) => `Layer [${layer}] doit avoir comme source de données [${source}]`,
};
export const mapboxStyleValidationEnTranslations: Translations<"en">["mapboxStyleValidation"] = {
    no_source: "No data source",
    only_one_source: "There must only be one data source",
    source_is_missing: "Layer: source is mandatory",
    source_layer_is_missing: "Layer: source-layer is mandatory",
    source_layer_not_matching: ({ layer }) => `source-layer [${layer}] does not correspond to any layer of the service`,
    incorrect_source: ({ layer, source }) => `Layer [${layer}] must have [${source}] as its data source`,
};
