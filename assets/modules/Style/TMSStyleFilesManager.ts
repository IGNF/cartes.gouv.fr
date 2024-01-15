import { v4 as uuidv4 } from "uuid";
import SldStyleParser from "geostyler-sld-parser";
import MapboxParser from "geostyler-mapbox-parser";
import { Service, StyleForm, StyleFormat, TmsMetadata } from "../../types/app";
import BaseStyleFilesManager from "./BaseStyleFilesManager";
import { Sources } from "mapbox-gl";

type PartialAnyLayer =
    | mapboxgl.BackgroundLayer
    | mapboxgl.CircleLayer
    | mapboxgl.FillExtrusionLayer
    | mapboxgl.FillLayer
    | mapboxgl.HeatmapLayer
    | mapboxgl.HillshadeLayer
    | mapboxgl.LineLayer
    | mapboxgl.RasterLayer
    | mapboxgl.SymbolLayer;

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
            throw new Error("tms_metadata n'est pas defini dans le service");
        }

        const formData = new FormData();
        switch (this.inputFormat) {
            case "sld":
            case "qml":
                return this.#merge(values, layersMapping);
            case "mapbox": // TODO
                break;
        }
        return formData;
    }

    async #merge(values: StyleForm, layersMapping: Record<string, string>): Promise<FormData> {
        const formData = new FormData();
        formData.append("style_name", values.style_name);

        const style: mapboxgl.Style = this.#buildEmptyStyle();

        for (const [uuid, files] of Object.entries(values.style_files)) {
            if (0 !== files.length) {
                const layer = await this.#toMapboxLayer(layersMapping[uuid], files[0]);
                style.layers.push(layer);
            }
        }

        const id = uuidv4();
        formData.append(`style_files[${id}]`, new Blob([JSON.stringify(style)], { type: "application/json" }));

        return formData;
    }

    async #toMapboxLayer(layerName: string, file: File) {
        const styleString = await file.text();

        const sldParser = new SldStyleParser({ sldVersion: "1.0.0" });
        const { output } = await sldParser.readStyle(styleString);

        if (output === undefined) throw Error("Erreur dans le 'parsing' du fichier");

        const mbParser = new MapboxParser();
        const { output: mbStyle } = await mbParser.writeStyle(output);
        if (mbStyle === undefined) throw Error("Erreur dans l'écriture du style mapbox");

        const layer = mbStyle.layers[0] as PartialAnyLayer;

        layer.id = uuidv4();
        layer.source = this.#metadata?.name;
        layer["source-layer"] = layerName;
        return layer;
    }

    #buildEmptyStyle(): mapboxgl.Style {
        if (!this.#metadata) {
            throw new Error("tms_metadata n'est pas defini dans le service");
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
