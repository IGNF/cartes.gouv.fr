import MapboxStyleParser from "geostyler-mapbox-parser";
import OpenLayersParser from "geostyler-openlayers-parser";
import QGISStyleParser from "geostyler-qgis-parser";
import SldStyleParser from "geostyler-sld-parser";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import BaseLayer from "ol/layer/Base";
import VectorLayer from "ol/layer/Vector";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorSource from "ol/source/Vector";
import { CartesStyle } from "../../@types/app";
import { getFileExtension } from "../../utils";

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

    static async applyStyle(layer: BaseLayer, currentStyle: CartesStyle | undefined) {
        if (!currentStyle) return;

        if (layer instanceof VectorLayer || layer instanceof VectorTileLayer) {
            const nameMandatory = layer instanceof VectorLayer ? true : false;
            const style = await StyleHelper.#getOlStyle(layer, currentStyle, nameMandatory);
            if (style) {
                layer.setStyle(style);
            }
        }
    }

    static async #getOlStyle(layer: VectorLayer<VectorSource<Feature<Geometry>>> | VectorTileLayer, currentStyle: CartesStyle, nameMandatory = true) {
        let styleUrl;
        if (nameMandatory) {
            // Le nom est obligatoire pour les flux WFS
            const name = layer.get("name");
            const s = currentStyle.layers.filter((l) => l.name === name);
            if (s.length) styleUrl = s[0].url;
            else return undefined;
        } else styleUrl = currentStyle.layers[0].url;

        const olParser = new OpenLayersParser();

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

        let style;
        if (["sld", "qml"].includes(extension!)) {
            style = await parser.readStyle(styleString);
        } else style = await parser.readStyle(JSON.parse(styleString));

        const { output } = style;
        if (output) {
            const parsed = await olParser.writeStyle(output);
            return parsed.output;
        }
    }
}

export default StyleHelper;
