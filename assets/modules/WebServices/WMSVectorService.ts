import WMSCapabilities from "ol/format/WMSCapabilities";
import { transformExtent } from "ol/proj";
import { Service } from "../../types/app";
import getRequestInfo from "./ServiceUtils";
import olDefaults from "../../data/ol-defaults.json";
import TileLayer from "ol/layer/Tile";
import TileWMSSource from "ol/source/TileWMS.js";

export default class WMSVectorService {
    _offering: Service;
    _requestInfo: Record<string, string>;
    _parser: WMSCapabilities;

    constructor(offering: Service) {
        this._offering = offering;
        this._requestInfo = getRequestInfo(offering.urls[0].url);
        this._parser = new WMSCapabilities();
    }

    async getLayers(): Promise<TileLayer<TileWMSSource>[]> {
        const layers: TileLayer<TileWMSSource>[] = [];

        const url = `${this._requestInfo.base_url}?service=${this._requestInfo.service}&version=${this._requestInfo.version}&request=GetCapabilities`;
        const response = await fetch(url);
        if (!response.ok) {
            return Promise.reject(new Error("GetCapabilities failed"));
        }

        const xmlString = await response.text();
        const wmsCaps = this._parser.read(xmlString);

        const lays = wmsCaps.Capability.Layer.Layer.filter((layer) => {
            return layer.Name === this._requestInfo.layers;
        });
        if (!lays.length) {
            return Promise.reject(new Error(`Layer ${this._requestInfo.layers} not found in GetCapabilities`));
        }

        const l = lays[0];
        const extent = transformExtent(l.EX_GeographicBoundingBox, "EPSG:4326", olDefaults.projection);
        layers.push(
            new TileLayer({
                source: new TileWMSSource({
                    url: this._requestInfo.base_url,
                    params: {
                        LAYERS: this._requestInfo.layers,
                    },
                }),
                extent: extent,
                properties: {
                    name: l.Name,
                    title: l.Title,
                    abstract: l.Abstract,
                },
            })
        );

        return layers;
    }
}
