import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import VectorTileLayer from "ol/layer/VectorTile";
import path from "../../functions/path";
import SldStyleParser from "geostyler-sld-parser";
import QGISStyleParser from "geostyler-qgis-parser";
import MapboxStyleParser from "geostyler-mapbox-parser";
import OpenLayersParser from "geostyler-openlayers-parser";
import { CartesStyle } from "../../types/app";
import { Geometry } from "ol/geom";
import BaseLayer from "ol/layer/Base";

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

    static format(values: AddStyleFormType, layersMapping: Record<string, string>): FormData {
        const formData = new FormData();

        formData.append("style_name", values.style_name);
        for (const [uuid, list] of Object.entries(values.style_files)) {
            if (!list.length) {
                continue;
            }
            if (uuid in layersMapping) {
                formData.append(`style_files[${layersMapping[uuid]}]`, list[0]);
            } else {
                formData.append("style_files", list[0]);
            }
        }
        return formData;
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

    static async applyStyle(layers: BaseLayer[], currentStyle: CartesStyle) {
        if (currentStyle === undefined) {
            return;
        }

        for (const layer of layers) {
            // TODO Quid VectorTileLayer ?
            if (layer instanceof VectorLayer) {
                const style = await StyleHelper.#getOlStyle(layer, currentStyle);
                if (style) {
                    layer.setStyle(style);
                }
            }
        }
    }

    static async #getOlStyle(layer: VectorLayer<VectorSource<Geometry>> | VectorTileLayer, currentStyle: CartesStyle) {
        const name = layer.get("name");
        const s = currentStyle.layers.filter((l) => l.name === name);
        if (!s.length) return undefined;

        const olParser = new OpenLayersParser();

        // Lecture du fichier
        const response = await fetch(s[0].url);

        if (!response.ok) return undefined;
        const xmlString = await response.text();

        const extension = path.getFileExtension(s[0].url);

        let parser;
        switch (extension) {
            case "sld": {
                parser = new SldStyleParser({ sldVersion: "1.0.0" });
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

        const { output } = await parser.readStyle(xmlString);

        if (output) {
            const parsed = await olParser.writeStyle(output);
            return parsed.output;
        }
    }
}

export default StyleHelper;
