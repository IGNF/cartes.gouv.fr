import { MbStyle } from "geostyler-mapbox-parser";
import OpenLayersParser from "geostyler-openlayers-parser";
import { ReadStyleResult } from "geostyler-style";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import BaseLayer from "ol/layer/Base";
import VectorLayer from "ol/layer/Vector";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorSource from "ol/source/Vector";

import { isCarteStyle, mbParser, qgisParser, sldParser } from "@/utils/geostyler";
import { CartesStyle, GeostylerStyle, GeostylerStyles, StyleLayer } from "../../@types/app";
import { getFileExtension } from "../../utils";

class StyleHelper {
    static async applyStyle(layer: BaseLayer, currentStyle: CartesStyle | GeostylerStyles | undefined) {
        if (!currentStyle) return;
        if (!StyleHelper.#filterLayer(layer)) return;

        let style: GeostylerStyle | undefined;
        if (isCarteStyle(currentStyle)) {
            style = await StyleHelper.#getStyleFromUrl(layer, currentStyle);
        } else {
            style = StyleHelper.#getGeoReadStyle(layer, currentStyle);
        }
        if (style?.style) {
            const readStyle = await StyleHelper.#getReadStyle(style);

            if (readStyle) {
                const olStyle = await StyleHelper.#getOlStyle(readStyle);
                if (olStyle) {
                    layer.setStyle(olStyle);
                }
            }
        }
    }

    static #filterLayer(layer: BaseLayer): layer is VectorLayer<VectorSource<Feature<Geometry>>> | VectorTileLayer {
        return layer instanceof VectorLayer || layer instanceof VectorTileLayer;
    }

    static async #getReadStyle(currentStyle: GeostylerStyle): Promise<ReadStyleResult | undefined> {
        const { style, format } = currentStyle;
        switch (format) {
            case "sld":
                return sldParser.readStyle(style);
            case "qml":
                return qgisParser.readStyle(style);
            case "mapbox":
                return mbParser.readStyle(JSON.parse(style) as MbStyle);
        }
    }

    static #getGeoReadStyle(layer: VectorLayer<VectorSource<Feature<Geometry>>> | VectorTileLayer, currentStyle: GeostylerStyles): GeostylerStyle | undefined {
        const nameMandatory = layer instanceof VectorLayer ? true : false;

        if (nameMandatory) {
            const style = currentStyle.find((s) => s.name === (layer.get("name") as string));
            return style ? { name: style.name, style: style.style, format: style.format } : undefined;
        } else {
            const style = currentStyle[0];
            return style ? { style: style.style, format: style.format } : undefined;
        }
    }

    static async #getStyleFromUrl(
        layer: VectorLayer<VectorSource<Feature<Geometry>>> | VectorTileLayer,
        currentStyle: CartesStyle
    ): Promise<GeostylerStyle | undefined> {
        const nameMandatory = layer instanceof VectorLayer ? true : false;

        let style: StyleLayer;
        const name = layer.get("name") as string;
        if (nameMandatory) {
            // Le nom est obligatoire pour les flux WFS
            const s = currentStyle.layers.filter((l) => l.name === name);
            if (s.length) style = s[0];
            else return undefined;
        } else style = currentStyle.layers[0];

        // Lecture du fichier
        const response = await fetch(style.url, { cache: "no-store" });

        if (!response.ok) return undefined;
        const styleString = await response.text();

        const extension = getFileExtension(style.url);
        return { annexeId: style.annexe_id, name, style: styleString, format: ["sld", "qml"].includes(extension!) ? (extension as "sld" | "qml") : "mapbox" };
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
