import { FC, useCallback, useEffect, useMemo, useRef } from "react";

import Map from "ol/Map";
import View from "ol/View";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import TileLayer from "ol/layer/Tile";
import BaseLayer from "ol/layer/Base";
import { createOrUpdate } from "ol/extent";
import { defaults as defaultInteractions } from "ol/interaction";
import { fromLonLat, transformExtent } from "ol/proj";
import GetFeatureInfo from "geoportal-extensions-openlayers/src/OpenLayers/Controls/GetFeatureInfo";
import LayerSwitcher from "geoportal-extensions-openlayers/src/OpenLayers/Controls/LayerSwitcher";
import SearchEngine from "geoportal-extensions-openlayers/src/OpenLayers/Controls/SearchEngine";
import { OfferingDetailResponseDtoTypeEnum } from "../../types/entrepot";
import type { CartesStyle } from "../../types/app";
import StyleHelper from "../../modules/Style/StyleHelper";
import useCapabilities from "../../hooks/useCapabilities";
import olDefaults from "../../data/ol-defaults.json";
import "geoportal-extensions-openlayers/dist/GpPluginOpenLayers.css";
import "../../sass/components/map-view.scss";
import "../../sass/components/ol.scss";

export interface MapInitial {
    type: OfferingDetailResponseDtoTypeEnum;
    bbox?: {
        west: number;
        south: number;
        east: number;
        north: number;
    };
    currentStyle?: CartesStyle;
    layers: BaseLayer[];
}

type RMapProps = {
    initial: MapInitial;
    currentStyle?: CartesStyle;
};

/**
 * Recherche d'un controle de la carte par son nom
 * @param map La carte
 * @param className Nom de la classe du control
 * @returns
 */
const getControl = (map: Map | undefined, className: string): typeof LayerSwitcher | typeof GetFeatureInfo => {
    if (!map) return undefined;

    let control;
    map.getControls().forEach((c) => {
        if (c.constructor.name === className) control = c;
    });
    return control;
};

const RMap: FC<RMapProps> = ({ initial, currentStyle }) => {
    const mapTargetRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map>();

    const { data: capabilities } = useCapabilities();

    // Extent dans la configuration
    const extent = useMemo(() => {
        let extent;

        const bbox = initial.bbox;
        if (bbox) {
            extent = createOrUpdate(bbox.west, bbox.south, bbox.east, bbox.north);
            extent = transformExtent(extent, "EPSG:4326", olDefaults.projection);
        }
        return extent;
    }, [initial.bbox]);

    const gfinfo = useMemo(() => {
        return [OfferingDetailResponseDtoTypeEnum.WFS, OfferingDetailResponseDtoTypeEnum.WMSVECTOR, OfferingDetailResponseDtoTypeEnum.WMTSTMS].includes(
            initial.type
        );
    }, [initial.type]);

    /**
     * Ajout de la couche dans la carte (+ dans le layerSwitcher)
     */
    const addLayer = useCallback(
        (layer: BaseLayer): void => {
            if (initial.currentStyle) {
                StyleHelper.applyStyle(layer, initial.currentStyle);
            }
            // Ajout du layer dans la carte et dans le LayerSwitcher
            mapRef.current?.addLayer(layer);
            getControl(mapRef.current, "LayerSwitcher")?.addLayer(layer, {
                title: layer.get("title"),
                description: layer.get("abstract"),
            });
        },
        [initial.currentStyle]
    );

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
            if (!capabilities) return;

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
                layer.set("name", capLayer?.Identifier);
                layer.set("title", capLayer?.Title);
                addLayer(layer);
            }

            const layers = initial.layers;

            const gfiLayers: object[] = [];
            layers.forEach((layer) => {
                addLayer(layer);
                if (gfinfo) {
                    gfiLayers.push({ obj: layer });
                }
            });
            getControl(mapRef.current, "GetFeatureInfo")?.setLayers(gfiLayers);

            // On zoom sur l'extent de la couche au premier rendu
            if (extent) {
                mapRef.current?.getView().fit(extent);
            }
        })();
    }, [capabilities, extent, addLayer, gfinfo, initial.layers]);

    useEffect(() => {
        if (!mapRef.current) {
            return;
        }
        const layers = mapRef.current.getLayers().getArray();
        layers.forEach((layer) => {
            if (olDefaults.default_background_layer !== layer.get("name")) {
                StyleHelper.applyStyle(layer, currentStyle);
            }
        });
    }, [currentStyle]);

    return <div className={"map-view"} ref={mapTargetRef} />;
};

export default RMap;
