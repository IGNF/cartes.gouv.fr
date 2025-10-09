import { AnyLayer, Sources as MbSources, Style as MbStyle, VectorSource } from "mapbox-gl";

import { Service, StyleFormatEnum } from "@/@types/app";
import { getParserForFormat, mbParser } from "@/utils/geostyler";

export default class TMSStyleTools {
    buildMbStyle(service: Service, style: string | MbStyle): MbStyle {
        const emptyStyle = this.#getEmptyStyle(service);
        const mapboxStyle = typeof style === "string" ? (JSON.parse(style) as MbStyle) : style;

        const layers = mapboxStyle.layers.map((layer) => ({
            ...layer,
            source: service.tms_metadata?.name,
            "source-layer": layer["source-layer"] ?? service.tms_metadata?.name,
        }));

        return { ...mapboxStyle, ...emptyStyle, layers };
    }

    /** Transforme un ensemble de styles SLD ou QML en un seul style Mapbox */
    async getMbStyleFromSLDQML(
        service: Service,
        layerNames: string[],
        styleFiles: Record<string, string>,
        styleFormats: Record<string, StyleFormatEnum>
    ): Promise<MbStyle> {
        const style = this.#getEmptyStyle(service);

        const layersArrays = await Promise.all(
            layerNames.map(async (name) => {
                const styleStr = styleFiles?.[name];
                if (styleStr) {
                    return await this.#toMapboxLayers(service, name, styleStr, styleFormats);
                }
                return [];
            })
        );

        style.layers = layersArrays.flat();

        return style;
    }

    async #toMapboxLayers(service: Service, layerName: string, styleString: string, styleFormats: Record<string, StyleFormatEnum>): Promise<AnyLayer[]> {
        const parser = getParserForFormat(styleFormats[layerName]);

        const { output } = await parser.readStyle(styleString);
        if (!output) throw new Error(`Erreur lors de la lecture du style ${styleFormats[layerName]} pour la couche ${layerName}`);

        const { output: mbStyle } = await mbParser.writeStyle(output);
        if (!mbStyle?.layers)
            throw new Error(`Erreur lors de conversion du style vers Mapbox pour la couche ${layerName} depuis le format ${styleFormats[layerName]}`);

        return mbStyle.layers.map((layer) => ({
            ...layer,
            source: service.tms_metadata!.name,
            "source-layer": layerName,
        }));
    }

    #getEmptyStyle(service: Service): MbStyle {
        if (!service.tms_metadata?.name) {
            throw new Error("Métadonnées du service TMS manquantes");
        }

        const serviceUrl = service.urls?.find((url) => url.type === "TMS")?.url;
        const sources: MbSources = {
            [service.tms_metadata.name]: {
                type: "vector",
                tiles: service.tms_metadata.tiles,
                minzoom: service.tms_metadata.minzoom,
                maxzoom: service.tms_metadata.maxzoom,
            },
        };
        if (serviceUrl !== undefined) {
            (sources[service.tms_metadata.name] as VectorSource).url = serviceUrl + "/metadata.json";
        }

        return {
            version: 8,
            sources: sources,
            layers: [],
            name: service.tms_metadata.name,
        };
    }
}
