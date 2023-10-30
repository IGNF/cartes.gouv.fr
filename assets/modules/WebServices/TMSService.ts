import { XMLParser } from "fast-xml-parser";
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
