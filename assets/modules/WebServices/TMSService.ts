import { XMLParser } from "fast-xml-parser";
import MVT from "ol/format/MVT.js";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import { Service } from "../../@types/app";
import { type TMSResponse } from "../../@types/tms";
import BaseService from "./BaseService";

type VectorLayerType = {
    id: string;
};
class TMSService extends BaseService {
    constructor(service: Service) {
        super(service);
    }

    getLayerNames() {
        const layers: string[] = [];
        if (this.service.tms_metadata) {
            const vectorLayers = this.service.tms_metadata?.vector_layers as VectorLayerType[];
            vectorLayers.forEach((layer) => {
                layers.push(layer.id);
            });
        }

        return layers;
    }

    async getLayers() {
        const layers: VectorTileLayer[] = [];

        if (!this.service.tms_metadata) {
            throw Error(`Metadata in service ${this.service._id} does not exist`);
        }

        // On ne conserve que l'URL du TMS
        const tmsUrl = this.service.urls.filter((descUrl) => {
            return descUrl.type === "TMS";
        });

        const metadatas = this.service.tms_metadata;
        const infos = await this.#getInfo(tmsUrl?.[0].url);

        const layer = new VectorTileLayer({
            minZoom: metadatas.minzoom,
            maxZoom: metadatas.maxzoom,
            declutter: true,
            source: new VectorTileSource({
                attributions: this.getAttribution(),
                url: metadatas.tiles?.[0],
                format: new MVT(),
                minZoom: metadatas.minzoom,
                maxZoom: metadatas.maxzoom,
                tileSize: infos.tileSize,
            }),
            properties: {
                title: infos.title,
                abstract: metadatas.description,
            },
        });
        layers.push(layer);
        return layers;
    }

    async #getInfo(url: string): Promise<{ title: string; tileSize: number[] }> {
        const response = await fetch(url);
        if (!response.ok) throw Error(`Error fetching URL ${url}.`);

        const xml = await response.text();
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });

        const json: TMSResponse = parser.parse(xml);
        return {
            title: json.TileMap.Title,
            tileSize: [parseInt(json.TileMap.TileFormat.width, 10), parseInt(json.TileMap.TileFormat.height, 10)],
        };
    }
}

export default TMSService;
