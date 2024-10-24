import TileLayer from "ol/layer/Tile";
import { LayerTypes } from "../../@types/ol";
import BaseService from "./BaseService";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import { getRequestInfo } from "../../utils";
import WMTSCapabilities from "ol/format/WMTSCapabilities";

class WMTSService extends BaseService {
    getLayerNames(): string[] {
        return [this.service.layer_name];
    }

    async getLayers(): Promise<LayerTypes[]> {
        // On ne conserve que l'URL du WMTS
        const wmtsUrl = this.service.urls.find((descUrl) => {
            return descUrl.type === "WMTS";
        });
        if (wmtsUrl?.url === undefined) {
            throw new Error("L'URL du flux WMTS n'a pas été trouvée");
        }

        const capabilities = await this.#getCapabilities(wmtsUrl.url);

        const wmtsOptions = optionsFromCapabilities(capabilities, {
            layer: this.service.layer_name,
        });

        if (!wmtsOptions) return [];
        const capsLayer = capabilities.Contents.Layer.find((layer) => layer.Identifier === this.service.layer_name) ?? null;

        const wmtsSource = new WMTS({
            ...wmtsOptions,
            attributions: this.getAttribution(),
        });
        if (capsLayer) {
            wmtsSource.setProperties({
                name: capsLayer.Identifier ?? null,
                title: capsLayer.Title ?? null,
                abstract: capsLayer.abstract ?? null,
            });
        }
        const wmtsLayer = new TileLayer({
            source: wmtsSource,
        });
        return [wmtsLayer];
    }

    async #getCapabilities(wmtsUrl: string) {
        const requestInfo = getRequestInfo(wmtsUrl);

        const sp = new URLSearchParams();
        sp.append("service", requestInfo.service);
        sp.append("request", "GetCapabilities");
        sp.append("version", requestInfo.version);
        const getCapParams = sp.toString();

        const getCapUrl = `${requestInfo.base_url}?${getCapParams}`;

        const format = new WMTSCapabilities();
        const response = await fetch(getCapUrl);
        const text = await response.text();

        return format.read(text);
    }
}

export default WMTSService;
