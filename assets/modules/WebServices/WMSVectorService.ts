import WMSCapabilities from "ol/format/WMSCapabilities";
import { transformExtent } from "ol/proj";
import { Service } from "../../types/app";
import olDefaults from "../../data/ol-defaults.json";
import TileLayer from "ol/layer/Tile";
import TileWMSSource from "ol/source/TileWMS.js";
import BaseService from "./BaseService";
import { getRequestInfo } from "../../utils";
class WMSVectorService extends BaseService {
    #requestInfo: Record<string, string>;
    #parser: WMSCapabilities;

    constructor(service: Service) {
        super(service);

        this.#requestInfo = getRequestInfo(service.urls[0].url);
        this.#parser = new WMSCapabilities();
    }

    getLayerNames() {
        return [this.#requestInfo.layers];
    }

    async getLayers(): Promise<TileLayer<TileWMSSource>[]> {
        const layers: TileLayer<TileWMSSource>[] = [];

        const url = `${this.#requestInfo.base_url}?service=${this.#requestInfo.service}&version=${this.#requestInfo.version}&request=GetCapabilities`;
        const response = await fetch(url);
        if (!response.ok) {
            return Promise.reject(new Error("GetCapabilities failed"));
        }

        const xmlString = await response.text();
        const wmsCaps = this.#parser.read(xmlString);

        const lays = wmsCaps.Capability.Layer.Layer.filter((layer) => {
            return layer.Name === this.#requestInfo.layers;
        });
        if (!lays.length) {
            return Promise.reject(new Error(`Layer ${this.#requestInfo.layers} not found in GetCapabilities`));
        }

        const l = lays[0];
        const extent = transformExtent(l.EX_GeographicBoundingBox, "EPSG:4326", olDefaults.projection);
        layers.push(
            new TileLayer({
                source: new TileWMSSource({
                    attributions: this.getAttribution(),
                    url: this.#requestInfo.base_url,
                    params: {
                        LAYERS: this.#requestInfo.layers,
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

export default WMSVectorService;
