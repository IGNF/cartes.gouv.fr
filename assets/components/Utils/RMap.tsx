import GetFeatureInfo from "geoportal-extensions-openlayers/src/OpenLayers/Controls/GetFeatureInfo";
import LayerSwitcher from "geoportal-extensions-openlayers/src/OpenLayers/Controls/LayerSwitcher";
import SearchEngine from "geoportal-extensions-openlayers/src/OpenLayers/Controls/SearchEngine";
import Map from "ol/Map";
import View from "ol/View";
import { createOrUpdate } from "ol/extent";
import { defaults as defaultInteractions } from "ol/interaction";
import { fromLonLat, transformExtent } from "ol/proj";
import { FC, useEffect, useRef, useState } from "react";

import WFSService from "../../modules/WebServices/WFSService";
import GeoservicesWMTS from "../../modules/ol/GeoservicesWMTS";
import type { Service, TypeInfosWithBbox } from "../../types/app";

import "geoportal-extensions-openlayers/dist/GpPluginOpenLayers.css";
import "../../sass/components/map-view.scss";
import "../../sass/components/ol.scss";

type RMapProps = {
    projection?: string;
    center?: [number, number];
    zoom?: number;
    service: Service;
};

const backgroundIdentifier = "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2";

// LES CONTROLES DE L'API GEOPORTAIL
let layerSwitcher, getFeatureInfo;

const RMap: FC<RMapProps> = ({ service, projection = "EPSG:3857", center = [2.35, 48.8, 5], zoom = 10 }) => {
    const mapElementRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map>();

    const [bgLayerLoaded, setBgLayerLoaded] = useState<boolean>(false);

    // Extent dans la configuration
    let extent;

    const bbox = (service.configuration.type_infos as TypeInfosWithBbox)?.bbox;
    if (bbox) {
        extent = createOrUpdate(bbox.west, bbox.south, bbox.east, bbox.north);
        extent = transformExtent(extent, "EPSG:4326", projection);
    }

    const addLayer = (layer) => {
        if (mapRef.current) {
            mapRef.current.addLayer(layer);
            layerSwitcher.addLayer(layer, {
                title: layer.get("title"),
                description: layer.get("abstract"),
            });
        }
    };
    useEffect(() => {
        const getBackgroundLayer = async () => {
            const layer = await GeoservicesWMTS.getLayer("cartes", backgroundIdentifier);
            return layer;
        };

        // Creation de la carte
        if (!mapRef.current) {
            // Creation du layerSwitcher
            layerSwitcher = new LayerSwitcher();
            getFeatureInfo = new GetFeatureInfo({
                options: {
                    // auto: true,
                    active: true,
                    hidden: true,
                },
            });

            mapRef.current = new Map({
                view: new View({
                    projection: projection,
                    center: fromLonLat(center),
                    zoom: zoom,
                }),
                interactions: defaultInteractions(),
                controls: [
                    layerSwitcher,
                    new SearchEngine({
                        collapsed: false,
                        displayAdvancedSearch: false,
                        apiKey: "essentiels",
                        zoomTo: "auto",
                    }),
                    getFeatureInfo,
                ],
            });

            // Ajout de Plan IGN V2
            getBackgroundLayer()
                .then((layer) => {
                    addLayer(layer);
                })
                .catch((error) => {
                    console.log(error);
                })
                .finally(() => setBgLayerLoaded(true));
        }
        mapRef.current.setTarget(mapElementRef.current || "");

        /* We set map target to undefined to represent a
         * nonexistent HTML element ID, when the React component is unmounted.
         * This prevents multiple maps being added to the map container on a
         * re-render.
         */
        return () => mapRef.current?.setTarget(undefined);
    }, [projection, center, zoom]);

    useEffect(() => {
        const getLayers = async () => {
            switch (service.type) {
                case "WFS": {
                    const wfs = new WFSService(service, projection);
                    return await wfs.getLayers();
                }
                default:
                    break;
            }
        };
        if (bgLayerLoaded) {
            getLayers()
                .then((layers) => {
                    const gfiLayers: object[] = [];
                    layers?.forEach((layer) => {
                        addLayer(layer);
                        gfiLayers.push({ obj: layer });
                    });
                    getFeatureInfo.setLayers(gfiLayers);

                    if (extent) {
                        mapRef.current?.getView().fit(extent);
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    }, [bgLayerLoaded, service, projection, extent]);

    return <div className={"map-view"} ref={mapElementRef} />;
};

export default RMap;
