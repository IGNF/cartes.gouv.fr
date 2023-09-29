import { FC, useEffect, useRef } from "react";

import Map from "ol/Map";
import View from "ol/View";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import TileLayer from "ol/layer/Tile";
import { createOrUpdate } from "ol/extent";
import { defaults as defaultInteractions } from "ol/interaction";
import { fromLonLat, transformExtent } from "ol/proj";
import GetFeatureInfo from "geoportal-extensions-openlayers/src/OpenLayers/Controls/GetFeatureInfo";
import LayerSwitcher from "geoportal-extensions-openlayers/src/OpenLayers/Controls/LayerSwitcher";
import SearchEngine from "geoportal-extensions-openlayers/src/OpenLayers/Controls/SearchEngine";
import WFSService from "../../modules/WebServices/WFSService";
import type { Service, TypeInfosWithBbox } from "../../types/app";
import useCapabilities from "../../hooks/useCapabilities";
import olDefaults from "../../data/ol-defaults.json";
import "geoportal-extensions-openlayers/dist/GpPluginOpenLayers.css";
import "../../sass/components/map-view.scss";
import "../../sass/components/ol.scss";

type RMapProps = {
    projection?: string;
    center?: [number, number];
    zoom?: number;
    service: Service;
};

const RMap: FC<RMapProps> = ({ service, projection = "EPSG:3857", center = [2.35, 48.8, 5], zoom = 10 }) => {
    const mapTargetRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map>();

    const { data: capabilities } = useCapabilities();

    // Extent dans la configuration
    let extent;

    const bbox = (service.configuration.type_infos as TypeInfosWithBbox)?.bbox;
    if (bbox) {
        extent = createOrUpdate(bbox.west, bbox.south, bbox.east, bbox.north);
        extent = transformExtent(extent, "EPSG:4326", projection);
    }

    /**
     * Retourne le controle correspondant au nom
     * @param name
     * @returns
     */
    const getControl = (name: string): typeof LayerSwitcher | typeof GetFeatureInfo => {
        if (mapRef.current) {
            mapRef.current.getControls().forEach((c) => {
                if (c.get("name") === name) return c;
            });
        }
        return undefined;
    };

    useEffect(() => {
        // Creation de la carte
        if (!mapRef.current) {
            const controls = [
                new LayerSwitcher({ name: "layerswitcher" }),
                new SearchEngine({
                    collapsed: false,
                    displayAdvancedSearch: false,
                    apiKey: "essentiels",
                    zoomTo: "auto",
                }),
                new GetFeatureInfo({
                    name: "getfeatureinfo",
                    options: {
                        active: true,
                        hidden: true,
                    },
                }),
            ];

            mapRef.current = new Map({
                view: new View({
                    projection: projection,
                    center: fromLonLat(center),
                    zoom: zoom,
                }),
                interactions: defaultInteractions(),
                controls: controls,
            });
        }
        mapRef.current.setTarget(mapTargetRef.current || "");

        /* We set map target to undefined to represent a
         * nonexistent HTML element ID, when the React component is unmounted.
         * This prevents multiple maps being added to the map container on a
         * re-render.
         */
        return () => mapRef.current?.setTarget(undefined);
    }, [projection, center, zoom]);

    useEffect(() => {
        const addLayer = (layer) => {
            if (mapRef.current) {
                mapRef.current.addLayer(layer);
                getControl("layerswitcher")?.addLayer(layer, {
                    title: layer.get("title"),
                    description: layer.get("abstract"),
                });
            }
        };

        const getLayers = async () => {
            // TODO Utiliser une factory ?
            switch (service.type) {
                case "WFS": {
                    const wfs = new WFSService(service, projection);
                    return await wfs.getLayers();
                }
                default:
                    break;
            }
        };

        if (capabilities && mapRef.current) {
            // Ajout de la couche de fond PlanIgnV2
            const wmtsOptions = optionsFromCapabilities(capabilities, {
                layer: olDefaults,
            });

            if (wmtsOptions) {
                const layer = new TileLayer({
                    opacity: 1,
                    source: new WMTS(wmtsOptions),
                });
                addLayer(layer);
            }

            getLayers()
                .then((layers) => {
                    const gfiLayers: object[] = [];
                    layers?.forEach((layer) => {
                        addLayer(layer);
                        gfiLayers.push({ obj: layer });
                    });
                    getControl("getfeatureinfo")?.setLayers(gfiLayers);
                    if (extent) {
                        mapRef.current?.getView().fit(extent);
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    }, [capabilities, service, projection, extent]);

    return <div className={"map-view"} ref={mapTargetRef} />;
};

export default RMap;
