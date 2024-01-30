import { XMLParser } from "fast-xml-parser";
import { Geometry } from "ol/geom";
import { transformExtent } from "ol/proj";
import { bbox as bboxStrategy } from "ol/loadingstrategy";
import GeoJSON from "ol/format/GeoJSON";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Service } from "../../types/app";
import BaseService from "./BaseService";
import { getRequestInfo } from "../../utils";
import olDefaults from "../../data/ol-defaults.json";

type LayerInfo = {
    Abstract: string;
    DefaultCRS: string;
    Name: string;
    Title: string;
    base_url: string;
    extent: number[];
    keywords: string[];
    version: string;
};

type WGS84BoundingBox = {
    "ows:LowerCorner": string;
    "ows:UpperCorner": string;
};

type FeatureType = {
    Abstract: string;
    DefaultCRS: string;
    Name: string;
    Title: string;
    "ows:Keywords": string | string[];
    "ows:WGS84BoundingBox": WGS84BoundingBox;
};

class WFSService extends BaseService {
    #format: GeoJSON;
    #featureTypes: FeatureType[];
    #parser: XMLParser;

    constructor(service: Service) {
        super(service);

        this.#format = new GeoJSON();
        this.#featureTypes = [];
        this.#parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
    }

    getLayerNames() {
        const layers: string[] = [];
        this.service.urls.forEach((endpointUrl) => {
            const info = getRequestInfo(endpointUrl.url);
            layers.push(info.typeNames);
        });
        return layers;
    }

    async getLayers() {
        const layers: VectorLayer<VectorSource<Geometry>>[] = [];

        for (const descUrl of this.service.urls) {
            const requestInfo = getRequestInfo(descUrl.url);
            if (!this.#featureTypes.length) {
                await this.#getFeatureTypes(requestInfo);
            }
            const info = this.#getInfo(requestInfo);
            if (info) {
                layers.push(this.#getLayer(info));
            }
        }

        return layers;
    }

    #getLayer(info: LayerInfo): VectorLayer<VectorSource<Geometry>> {
        const format = this.#format;

        const vectorSource = new VectorSource({
            format: format,
            attributions: this.getAttribution(),
            loader: function (ext, resolution, projection, success, failure) {
                const proj = projection.getCode();
                const bbox = transformExtent(ext, proj, "EPSG:4326").join(",") + ",EPSG:4326";

                const url = `${info.base_url}?SERVICE=WFS&REQUEST=GetFeature&VERSION=${info.version}&typeNames=${info.Name}&outputFormat=application/json&srsname=${proj}&bbox=${bbox}`;
                fetch(url)
                    .then((response) => {
                        if (!response.ok) {
                            throw response.statusText;
                        }
                        return response.json();
                    })
                    .then((response) => {
                        const features = format.readFeatures(response);
                        vectorSource.addFeatures(features);
                        success?.(features);
                    })
                    .catch(() => {
                        vectorSource.removeLoadedExtent(info.extent);
                        failure?.();
                    });
            },
            strategy: bboxStrategy,
        });

        return new VectorLayer({
            source: vectorSource,
            extent: transformExtent(info.extent, "EPSG:4326", olDefaults.projection),
            properties: {
                name: info.Name,
                title: info.Title,
                abstract: info.Abstract,
            },
        });
    }

    /**
     * Recupere les FeatureTypes a partir de la requete GetCapabilities
     */
    async #getFeatureTypes(requestInfo: Record<string, string>) {
        const sp = new URLSearchParams();
        sp.append("service", requestInfo.service);
        sp.append("request", "GetCapabilities");
        sp.append("version", requestInfo.version);
        const getCapParams = sp.toString();

        const getCapUrl = `${requestInfo.base_url}?${getCapParams}`;
        const result = await fetch(getCapUrl);

        const xml = await result.text();
        const xmlParsed = this.#parser.parse(xml);
        this.#featureTypes = xmlParsed["wfs:WFS_Capabilities"]["FeatureTypeList"]["FeatureType"];
    }

    /**
     * Recupere les infomations de la layer si celle-ci existe dans les FeatureTypes
     * @returns
     */
    #getInfo(requestInfo: Record<string, string>): LayerInfo | null {
        let featureTypeInfo;

        for (const featureType of this.#featureTypes) {
            const info: Partial<FeatureType> = {};
            ["Name", "Title", "Abstract"].forEach((key) => {
                info[key] = featureType[key];
            });
            const match = featureType["DefaultCRS"].match(/urn:ogc:def:crs:EPSG::(\d+)/);
            info["DefaultCRS"] = match ? `EPSG:${match[1]}` : "EPSG:4326";

            if (info.Name === requestInfo.typeNames) {
                featureTypeInfo = { base_url: requestInfo.base_url, version: requestInfo.version, ...info };

                let keywords = featureType["ows:Keywords"];
                if (!Array.isArray(keywords)) {
                    keywords = [keywords];
                }
                featureTypeInfo["keywords"] = keywords;
                featureTypeInfo["extent"] = [
                    ...featureType["ows:WGS84BoundingBox"]["ows:LowerCorner"].split(" "),
                    ...featureType["ows:WGS84BoundingBox"]["ows:UpperCorner"].split(" "),
                ].map(parseFloat);
                break;
            }
        }
        return featureTypeInfo;
    }
}

export default WFSService;
