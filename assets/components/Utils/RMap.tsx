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
import TMSService from "../../modules/WebServices/TMSService";

type RMapProps = {
    service: Service;
};

const RMap: FC<RMapProps> = ({ service }) => {
    const mapTargetRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map>();

    const { data: capabilities } = useCapabilities();

    // Extent dans la configuration
    let extent;
    const bbox = (service.configuration.type_infos as TypeInfosWithBbox)?.bbox;
    if (bbox) {
        extent = createOrUpdate(bbox.west, bbox.south, bbox.east, bbox.north);
        extent = transformExtent(extent, "EPSG:4326", olDefaults.projection);
    }

    const gfinfo = ["WFS", "WMTS-TMS"].includes(service.type);

    /**
     * Retourne le controle correspondant au nom
     * @param name
     * @returns
     */
    const getControl = (className: string): typeof LayerSwitcher | typeof GetFeatureInfo => {
        let control;
        if (mapRef.current) {
            mapRef.current.getControls().forEach((c) => {
                if (c.constructor.name === className) control = c;
            });
        }
        return control;
    };

    useEffect(() => {
        // Creation de la carte
        if (!mapRef.current) {
            const controls = [
                new LayerSwitcher(),
                new SearchEngine({
                    collapsed: false,
                    displayAdvancedSearch: false,
                    apiKey: "essentiels",
                    zoomTo: "auto",
                }),
            ];

            if (gfinfo) {
                controls.push(
                    new GetFeatureInfo({
                        options: {
                            active: true,
                            hidden: true,
                        },
                    })
                );
            }

            mapRef.current = new Map({
                view: new View({
                    projection: olDefaults.projection,
                    center: fromLonLat(olDefaults.center),
                    zoom: olDefaults.zoom,
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
    }, [gfinfo]);

    useEffect(() => {
        const addLayer = (layer) => {
            // Ajout du layer dans la carte et dans le LayerSwitcher
            if (mapRef.current) {
                mapRef.current.addLayer(layer);
                getControl("LayerSwitcher")?.addLayer(layer, {
                    title: layer.get("title"),
                    description: layer.get("abstract"),
                });
            }
        };

        const getLayers = async () => {
            // TODO Utiliser une factory ?
            switch (service.type) {
                case "WFS": {
                    const wfs = new WFSService(service);
                    return await wfs.getLayers();
                }
                case "WMTS-TMS": {
                    const tms = new TMSService(service);
                    return await tms.getLayers();
                }
                default:
                    break;
            }
        };

        if (capabilities && mapRef.current) {
            // Ajout de la couche de fond PlanIgnV2
            const wmtsOptions = optionsFromCapabilities(capabilities, {
                layer: olDefaults.default_background_layer,
            });

            if (wmtsOptions) {
                const capLayer = capabilities.Contents.Layer?.find((l) => {
                    return l.Identifier === olDefaults.default_background_layer;
                });

                const layer = new TileLayer({
                    opacity: 1,
                    source: new WMTS(wmtsOptions),
                });
                layer.set("title", capLayer?.Title);
                addLayer(layer);
            }

            getLayers()
                .then((layers) => {
                    const gfiLayers: object[] = [];
                    if (gfinfo) {
                        layers?.forEach((layer) => {
                            addLayer(layer);
                            gfiLayers.push({ obj: layer });
                        });
                        getControl("GetFeatureInfo")?.setLayers(gfiLayers);
                    }
                    if (extent) {
                        mapRef.current?.getView().fit(extent);
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    }, [capabilities, extent, service, gfinfo]);

    return <div className={"map-view"} ref={mapTargetRef} />;
};

export default RMap;
