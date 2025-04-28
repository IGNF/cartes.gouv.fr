import MapboxStyleParser, { MbStyle } from "geostyler-mapbox-parser";
import OpenLayersParser from "geostyler-openlayers-parser";
import QGISStyleParser from "geostyler-qgis-parser";
import SldStyleParser from "geostyler-sld-parser";
import { ReadStyleResult } from "geostyler-style";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import BaseLayer from "ol/layer/Base";
import VectorLayer from "ol/layer/Vector";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorSource from "ol/source/Vector";
import { CartesStyle, GeostylerStyles } from "../../@types/app";
import { getFileExtension } from "../../utils";
import { isCarteStyle, mbParser, qgisParser, sldParser } from "@/utils/geostyler";

type AddStyleFormType = {
    style_name: string;
    style_files: Record<string, FileList>;
};

class StyleHelper {
    // On verifie qu'il y a au moins un fichier de style a ajouter
    static check(values: AddStyleFormType): boolean {
        let numFiles = 0;
        for (const uuid in values.style_files) {
            if (values.style_files[uuid].length) {
                numFiles++;
            }
        }
        return numFiles !== 0;
    }

    /**
     * Retourne le style courant s'il existe
     * @param Style[] styles
     * @returns
     */
    static getCurrentStyle(styles: CartesStyle[] | undefined): CartesStyle | undefined {
        if (styles === undefined) {
            return undefined;
        }

        let style;
        for (const s of styles) {
            if ("current" in s || s.current === true) {
                style = s;
                break;
            }
        }
        return style;
    }

    static async applyStyle(layer: BaseLayer, currentStyle: CartesStyle | GeostylerStyles | undefined) {
        if (!currentStyle) return;

        if (layer instanceof VectorLayer || layer instanceof VectorTileLayer) {
            const nameMandatory = layer instanceof VectorLayer ? true : false;
            let readStyle: ReadStyleResult | undefined;
            if (isCarteStyle(currentStyle)) {
                readStyle = await StyleHelper.#getCarteReadStyle(layer, currentStyle, nameMandatory);
            } else {
                readStyle = await StyleHelper.#getGeoReadStyle(layer, currentStyle, nameMandatory);
            }
            if (readStyle) {
                const style = await StyleHelper.#getOlStyle(readStyle);
                if (style) {
                    layer.setStyle(style);
                }
            }
        }
    }

    static async #getGeoReadStyle(
        layer: VectorLayer<VectorSource<Feature<Geometry>>> | VectorTileLayer,
        currentStyle: GeostylerStyles,
        nameMandatory = true
    ): Promise<ReadStyleResult | undefined> {
        for (const { name, style, format } of currentStyle) {
            if (nameMandatory && layer.get("name") === name) {
                switch (format) {
                    case "sld":
                        return sldParser.readStyle(style as string);
                    case "qml":
                        return qgisParser.readStyle(style as string);
                    case "mapbox":
                        return mbParser.readStyle(style as MbStyle);
                }
            } else {
                // TODO: What should we do in that case ?
            }
        }
    }

    static async #getCarteReadStyle(
        layer: VectorLayer<VectorSource<Feature<Geometry>>> | VectorTileLayer,
        currentStyle: CartesStyle,
        nameMandatory = true
    ): Promise<ReadStyleResult | undefined> {
        let styleUrl;
        if (nameMandatory) {
            // Le nom est obligatoire pour les flux WFS
            const name = layer.get("name");
            const s = currentStyle.layers.filter((l) => l.name === name);
            if (s.length) styleUrl = s[0].url;
            else return undefined;
        } else styleUrl = currentStyle.layers[0].url;

        // Lecture du fichier
        const response = await fetch(styleUrl);

        if (!response.ok) return undefined;
        const styleString = await response.text();

        const extension = getFileExtension(styleUrl);

        let parser;
        switch (extension) {
            case "sld": {
                parser = new SldStyleParser({ locale: "fr" });
                break;
            }
            case "qml": {
                parser = new QGISStyleParser();
                break;
            }
            case "json": {
                parser = new MapboxStyleParser();
                break;
            }
        }

        if (!parser) return undefined;

        if (["sld", "qml"].includes(extension!)) {
            return parser.readStyle(styleString);
        }
        return parser.readStyle(JSON.parse(styleString));
    }

    static async #getOlStyle(style: ReadStyleResult) {
        const olParser = new OpenLayersParser();
        const { output } = style;
        if (output) {
            const parsed = await olParser.writeStyle(output);
            return parsed.output;
        }
    }
}

export default StyleHelper;
