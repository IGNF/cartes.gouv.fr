import { v4 as uuidv4 } from "uuid";
import SldStyleParser from "geostyler-sld-parser";
import MapboxParser from "geostyler-mapbox-parser";
import { Service, StyleForm, StyleFormat, TmsMetadata } from "../../@types/app";
import BaseStyleFilesManager from "./BaseStyleFilesManager";
import { Sources } from "mapbox-gl";
import QGISStyleParser from "geostyler-qgis-parser";
import { declareComponentKeys } from "i18nifty";
import { Translations, getTranslation } from "../../i18n/i18n";
import { AnyLayer } from "mapbox-gl/index";

const { t } = getTranslation("TMSStyleFilesManager");

export default class TMSStyleFilesManager implements BaseStyleFilesManager {
    readonly service: Service;
    readonly inputFormat: StyleFormat;
    #metadata: TmsMetadata | undefined;

    constructor(service: Service, inputFormat: StyleFormat) {
        this.service = service;
        this.inputFormat = inputFormat;
        this.#metadata = service.tms_metadata;
    }

    async prepare(values: StyleForm, layersMapping: Record<string, string>): Promise<FormData> {
        if (!this.#metadata) {
            throw new Error(t("metadata_not_defined"));
        }

        switch (this.inputFormat) {
            case "sld":
            case "qml":
                return this.#merge(values, layersMapping);
            case "mapbox":
                return this.#buildMapbox(values);
        }
    }

    async #merge(values: StyleForm, layersMapping: Record<string, string>): Promise<FormData> {
        const style: mapboxgl.Style = this.#buildEmptyStyle();

        for (const [uuid, files] of Object.entries(values.style_files)) {
            if (0 !== files.length) {
                const layers = await this.#toMapboxLayer(layersMapping[uuid], files[0]);
                style.layers = [...style.layers, ...layers];
            }
        }

        const layer = "no_layer";
        const blob = new Blob([JSON.stringify(style)], { type: "application/json" });

        const formData = new FormData();
        formData.append("style_name", values.style_name);
        formData.append(`style_files[${layer}]`, new File([blob], `${layer}.json`));

        return formData;
    }

    async #buildMapbox(values: StyleForm) {
        if (!this.#metadata) {
            throw new Error(t("metadata_not_defined"));
        }

        const files = values.style_files["no_layer"];

        const styleString = await files[0].text();
        const mapboxStyle = JSON.parse(styleString);

        mapboxStyle.sources = {
            [this.#metadata.name]: {
                type: "vector",
                tiles: this.#metadata.tiles,
                minzoom: this.#metadata.minzoom,
                maxzoom: this.#metadata.maxzoom,
            },
        };

        mapboxStyle.layers.forEach((layer) => {
            layer.id = uuidv4();
            layer.source = this.#metadata?.name;
        });

        const layer = "no_layer";
        const blob = new Blob([JSON.stringify(mapboxStyle)], { type: "application/json" });

        const formData = new FormData();
        formData.append("style_name", values.style_name);
        formData.append(`style_files[${layer}]`, new File([blob], `${layer}.json`));

        return formData;
    }

    async #toMapboxLayer(layerName, file) {
        const styleString = await file.text();

        const parser = this.inputFormat === "sld" ? new SldStyleParser({ locale: "fr" }) : new QGISStyleParser();

        const { output } = await parser.readStyle(styleString);
        if (output === undefined) throw Error(t("parsing_error"));

        const mbParser = new MapboxParser();
        const { output: mbStyle } = await mbParser.writeStyle(output);
        if (mbStyle === undefined) throw Error(t("writing_error"));

        const layers: AnyLayer[] = [];
        mbStyle.layers.forEach((layer) => {
            layer["source"] = this.#metadata?.name;
            layer["source-layer"] = layerName;
            layers.push(layer);
        });

        return layers;
    }

    #buildEmptyStyle(): mapboxgl.Style {
        if (!this.#metadata) {
            throw new Error(t("metadata_not_defined"));
        }

        const sources: Sources = {
            [this.#metadata.name]: {
                type: "vector",
                tiles: this.#metadata.tiles,
                minzoom: this.#metadata.minzoom,
                maxzoom: this.#metadata.maxzoom,
            },
        };

        return {
            version: 8,
            sources: sources,
            layers: [],
        };
    }
}

export const { i18n } = declareComponentKeys<"metadata_not_defined" | "parsing_error" | "writing_error">()("TMSStyleFilesManager");

export const TMSStyleFilesManagerFrTranslations: Translations<"fr">["TMSStyleFilesManager"] = {
    metadata_not_defined: "tms_metadata n'est pas defini dans le service",
    parsing_error: "Erreur dans l’analyse du fichier",
    writing_error: "Erreur dans l’écriture du style mapbox",
};
export const TMSStyleFilesManagerEnTranslations: Translations<"en">["TMSStyleFilesManager"] = {
    metadata_not_defined: "tms_metadata is not defined in service",
    parsing_error: "File parsing error",
    writing_error: "Writing mapbox style error",
};
