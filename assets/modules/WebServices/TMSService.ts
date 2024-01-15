/* import { XMLParser } from "fast-xml-parser";
import VectorTileSource from "ol/source/VectorTile";
import VectorTileLayer from "ol/layer/VectorTile";
import { fromLonLat, transformExtent } from "ol/proj";
import MVT from "ol/format/MVT.js";
import { Service } from "../../types/app";
import { type TMSResponse } from "../../types/tms";

type MetadatasType = {
    title: string;
    description: string;
    minzoom: number;
    maxzoom: number;
    tiles: string[] | null;
    tileSize: number;
};

export default class TMSService {
    _offering: Service;
    _url: string;

    constructor(offering: Service) {
        this._offering = offering;

        // On ne conserve que l'URL du TMS
        const tmsUrl = this._offering.urls.filter((descUrl) => {
            return descUrl.type === "TMS";
        });
        this._url = tmsUrl?.[0].url;
    }

    async getLayers(): Promise<VectorTileLayer[]> {
        const layers: VectorTileLayer[] = [];

        const metadatas = await this._getMetadatas();
        const layer = new VectorTileLayer({
            minZoom: metadatas.minzoom,
            maxZoom: metadatas.maxzoom,
            declutter: true,
            source: new VectorTileSource({
                url: metadatas.tiles?.[0],
                format: new MVT(),
                minZoom: metadatas.minzoom,
                maxZoom: metadatas.maxzoom,
                tileSize: metadatas.tileSize,
            }),
            properties: {
                title: metadatas.title,
                abstract: metadatas.description,
            },
        });
        layers.push(layer);
        return layers;
    }

    async _getMetadatas(): Promise<MetadatasType> {
        if (!this._url) throw Error("Url is not defined");

        const response = await fetch(this._url);
        if (!response.ok) throw Error(`Impossible d'accéder à l'URL ${this._url}.`);

        const xml = await response.text();
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });

        const json: TMSResponse = parser.parse(xml);
        const tileSize = json.TileMap.TileFormat.width;

        const md = await fetch(`${this._url}/metadata.json`);
        if (!md.ok) throw Error(`Impossible d'accéder à l'URL ${this._url}/metadata.json.`);
        const metadatas = await md.json();

        // Transformation de la bbox
        metadatas.bounds = transformExtent(metadatas.bounds, "EPSG:4326", "EPSG:3857");
        metadatas.center = fromLonLat(metadatas.center);

        return { ...metadatas, title: json.TileMap.Title, tileSize: tileSize };
    }
}
 */

import VectorTileSource from "ol/source/VectorTile";
import VectorTileLayer from "ol/layer/VectorTile";
import MVT from "ol/format/MVT.js";
import { Service } from "../../types/app";
import BaseService from "./BaseService";
import { XMLParser } from "fast-xml-parser";
import { type TMSResponse } from "../../types/tms";

type VectorLayerType = {
    id: string;
};
class TMSService implements BaseService {
    readonly service: Service;

    constructor(service: Service) {
        this.service = service;
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
