import { FC, useCallback, useEffect, useMemo, useRef } from "react";

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
import type { CartesStyle, Service, TypeInfosWithBbox } from "../../types/app";
import useCapabilities from "../../hooks/useCapabilities";
import olDefaults from "../../data/ol-defaults.json";
import "geoportal-extensions-openlayers/dist/GpPluginOpenLayers.css";
import "../../sass/components/map-view.scss";
import "../../sass/components/ol.scss";
import { OfferingDetailResponseDtoTypeEnum } from "../../types/entrepot";
import getWebService from "../../modules/WebServices/WebServices";
import StyleHelper from "../../modules/WebServices/StyleHelper";

type RMapProps = {
    service: Service;
};

const RMap: FC<RMapProps> = ({ service }) => {
    const mapTargetRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map>();

    const { data: capabilities } = useCapabilities();

    // Extent dans la configuration
    const extent = useMemo(() => {
        const bbox = (service.configuration.type_infos as TypeInfosWithBbox)?.bbox;
        let extent;

        if (bbox) {
            extent = createOrUpdate(bbox.west, bbox.south, bbox.east, bbox.north);
            extent = transformExtent(extent, "EPSG:4326", olDefaults.projection);
        }
        return extent;
    }, [service.configuration.type_infos]);

    const currentStyle: CartesStyle | undefined = useMemo(() => {
        return service.configuration.styles.find((style) => style.current === true);
    }, [service.configuration.styles]);

    const gfinfo = useMemo(() => {
        return [OfferingDetailResponseDtoTypeEnum.WFS, OfferingDetailResponseDtoTypeEnum.WMSVECTOR, OfferingDetailResponseDtoTypeEnum.WMTSTMS].includes(
            service.type
        );
    }, [service.type]);

    /**
     * Retourne le controle correspondant au nom
     * @param name
     * @returns
     */
    const getControl = useCallback((className: string): typeof LayerSwitcher | typeof GetFeatureInfo => {
        let control;
        if (mapRef.current) {
            mapRef.current.getControls().forEach((c) => {
                if (c.constructor.name === className) control = c;
            });
        }
        return control;
    }, []);

    const ready: boolean = useMemo(() => {
        return !!(mapRef.current && capabilities && extent);
    }, [capabilities, extent]);

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
        (async () => {
            const addLayer = (layer) => {
                StyleHelper.applyStyle(layer, currentStyle);

                // Ajout du layer dans la carte et dans le LayerSwitcher
                mapRef.current?.addLayer(layer);
                getControl("LayerSwitcher")?.addLayer(layer, {
                    title: layer.get("title"),
                    description: layer.get("abstract"),
                });
            };

            if (!ready) return;

            // Ajout de la couche de fond PlanIgnV2
            const wmtsOptions = optionsFromCapabilities(capabilities, {
                layer: olDefaults.default_background_layer,
            });

            if (wmtsOptions) {
                const capLayer = capabilities?.Contents.Layer?.find((l) => {
                    return l.Identifier === olDefaults.default_background_layer;
                });

                const layer = new TileLayer({
                    opacity: 1,
                    source: new WMTS(wmtsOptions),
                });
                layer.set("title", capLayer?.Title);
                addLayer(layer);
            }

            const layers = await getWebService(service).getLayers();

            const gfiLayers: object[] = [];
            layers.forEach((layer) => {
                addLayer(layer);
                if (gfinfo) {
                    gfiLayers.push({ obj: layer });
                }
            });
            getControl("GetFeatureInfo")?.setLayers(gfiLayers);

            // On zoom sur l'extent de la couche au premier rendu
            if (extent) {
                mapRef.current?.getView().fit(extent);
            }
        })();
    }, [ready, service, capabilities, currentStyle, getControl, extent, gfinfo]);

    return <div className={"map-view"} ref={mapTargetRef} />;
};

export default RMap;
