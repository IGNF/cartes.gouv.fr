import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import TileLayer from "ol/layer/Tile";
import WMTSCapabilities from "ol/format/WMTSCapabilities.js";

export default class GeoservicesWMST {
    static _geoserviceUrl = "https://wxs.ign.fr/__GPPKEY__/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities";

    static _capabilities = {};
    static async GetLayer(key: string, identifier: string): Promise<TileLayer<WMTS>> {
        if (!(key in this._capabilities)) {
            const url = this._geoserviceUrl.replace("__GPPKEY__", key);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Bad response from server : ${response.status}`);
            }

            const data = await response.text();

            const format = new WMTSCapabilities();
            const capabilities = format.read(data);
            if (!capabilities) {
                throw new Error("Reading capabilities failed");
            }

            this._capabilities[key] = capabilities;
        }

        const wmtsOptions = optionsFromCapabilities(this._capabilities[key], {
            layer: identifier,
            matrixSet: "EPSG:3857",
        });
        if (!wmtsOptions) {
            throw new Error("Identifier ${identifier} does not exist");
        }

        const layers = this._capabilities[key].Contents.Layer;
        const info = layers.find((l) => {
            return l.Identifier === identifier;
        });

        return new TileLayer({
            opacity: 1,
            source: new WMTS(wmtsOptions),
            properties: {
                name: info.Identifier,
                title: info.Title,
                abstract: info.Abstract,
            },
        });
    }
}
