import { XMLParser } from "fast-xml-parser";
import { Service } from "../../types/app";
import { Geometry } from "ol/geom";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector.js";
import GeoJSON from "ol/format/GeoJSON.js";
import { transformExtent } from "ol/proj";
import { bbox as bboxStrategy } from "ol/loadingstrategy.js";

type RequestInfo = {
    base_url: string;
    request: string;
    service: string;
    typeNames: string;
    version: string;
};

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

export type FeatureType = {
    Abstract: string;
    DefaultCRS: string;
    Name: string;
    Title: string;
    "ows:Keywords": string | string[];
    "ows:WGS84BoundingBox": WGS84BoundingBox;
};

export default class WFSService {
    _format: GeoJSON;
    _projection: string;
    _offering: Service;
    _requestInfo: RequestInfo | null;
    _parser: XMLParser;
    _featureTypes: FeatureType[];

    constructor(offering: Service, projection = "EPSG:3857") {
        this._offering = offering;
        this._projection = projection;
        this._requestInfo = null; // Variable de travail

        this._format = new GeoJSON();
        this._featureTypes = [];
        this._parser = new XMLParser();
    }

    async getLayers(): Promise<VectorLayer<VectorSource<Geometry>>[]> {
        // const layers: VectorLayer<VectorSource>[] = []; // Version 7.5.1 d'openlayers
        const layers: VectorLayer<VectorSource<Geometry>>[] = [];

        for (const descUrl of this._offering.urls) {
            this._requestInfo = this._getRequestInfo(descUrl.url);
            if (!this._featureTypes.length) {
                await this._getFeatureTypes();
            }
            const info = this._getInfo();
            if (info) {
                layers.push(this._getLayer(info));
            }
        }

        return layers;
    }

    _getLayer(info: LayerInfo): VectorLayer<VectorSource<Geometry>> {
        const format = this._format;

        const vectorSource = new VectorSource({
            format: format,
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
            extent: transformExtent(info.extent, "EPSG:4326", this._projection),
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
    async _getFeatureTypes() {
        if (this._requestInfo) {
            const sp = new URLSearchParams();
            sp.append("service", this._requestInfo.service);
            sp.append("request", "GetCapabilities");
            sp.append("version", this._requestInfo.version);
            const getCapParams = sp.toString();

            const getCapUrl = `${this._requestInfo.base_url}?${getCapParams}`;
            const result = await fetch(getCapUrl);

            const xml = await result.text();
            const xmlParsed = this._parser.parse(xml);
            this._featureTypes = xmlParsed["wfs:WFS_Capabilities"]["FeatureTypeList"]["FeatureType"];
        }
    }

    /**
     * Recupere les informations de la requete DescribeFeatureType
     * @param descFeatureTypeUrl
     * @returns
     */
    _getRequestInfo(descFeatureTypeUrl): RequestInfo {
        const url = new URL(descFeatureTypeUrl);
        const params: Partial<RequestInfo> = Object.fromEntries(url.searchParams);
        return { ...params, base_url: `${url.origin}${url.pathname}` } as RequestInfo;
    }

    /**
     * Recupere les infomations de la layer si celle-ci existe dans les FeatureTypes
     * @returns
     */
    _getInfo(): LayerInfo | null {
        let featureTypeInfo;

        for (const featureType of this._featureTypes) {
            const info: Partial<FeatureType> = {};
            ["Name", "Title", "Abstract"].forEach((key) => {
                info[key] = featureType[key];
            });
            const match = featureType["DefaultCRS"].match(/urn:ogc:def:crs:EPSG::(\d+)/);
            info["DefaultCRS"] = match ? `EPSG:${match[1]}` : "EPSG:4326";

            if (this._requestInfo && info.Name === this._requestInfo.typeNames) {
                featureTypeInfo = { base_url: this._requestInfo.base_url, version: this._requestInfo.version, ...info };

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
