import GetFeatureInfo from "geopf-extensions-openlayers/src/packages/Controls/GetFeatureInfo/GetFeatureInfo";
import LayerSwitcher from "geopf-extensions-openlayers/src/packages/Controls/LayerSwitcher/LayerSwitcher";
import SearchEngine from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/SearchEngine";
import GeoportalZoom from "geopf-extensions-openlayers/src/packages/Controls/Zoom/GeoportalZoom";
import Map from "ol/Map";
import View from "ol/View";
import { ScaleLine } from "ol/control";
import Attribution from "ol/control/Attribution";
import { createOrUpdate } from "ol/extent";
import { defaults as defaultInteractions } from "ol/interaction";
import BaseLayer from "ol/layer/Base";
import TileLayer from "ol/layer/Tile";
import { fromLonLat, transformExtent } from "ol/proj";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import { FC, useCallback, useEffect, useMemo, useRef } from "react";

import type { CartesStyle } from "../../@types/app";
import { OfferingDetailResponseDtoTypeEnum } from "../../@types/entrepot";
import olDefaults from "../../data/ol-defaults.json";
import useCapabilities from "../../hooks/useCapabilities";
import StyleHelper from "../../modules/Style/StyleHelper";

import "ol/ol.css";

import "geopf-extensions-openlayers/css/Dsfr.css";

import "../../sass/components/geopf-ext-ol-custom.scss";
import "../../sass/components/map-view.scss";

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

const RMap: FC<RMapProps> = ({ initial, currentStyle }) => {
    const mapTargetRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map>();

    const { data: capabilities } = useCapabilities();

    const bkLayer = useMemo(() => {
        return new TileLayer({ properties: { title: null, description: null } });
    }, []);

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

    const getControl = (className: string): typeof LayerSwitcher | typeof GetFeatureInfo => {
        const controls = mapRef.current
            ?.getControls()
            .getArray()
            .filter((c) => {
                return c.constructor.name === className;
            });
        return controls ? controls[0] : controls;
    };

    const getWorkingLayers = useCallback((): BaseLayer[] => {
        const workingLayers = mapRef.current
            ?.getLayers()
            .getArray()
            .filter((l) => l.get("name") !== olDefaults.default_background_layer);
        return workingLayers ? workingLayers : [];
    }, []);

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
            getControl("LayerSwitcher")?.addLayer(layer, {
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
                new GeoportalZoom({ position: "top-left" }),
                new Attribution({ collapsible: true, collapsed: true }),
                new LayerSwitcher({
                    options: {
                        position: "top-right",
                        collapsed: true,
                        panel: true,
                        counter: true,
                    },
                }),
                new ScaleLine(),
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
                        position: "top-right",
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
            // Suppression de tous les layers
            mapRef.current?.getLayers().clear();

            // Ajout de la couche de fond PlanIgnV2
            addLayer(bkLayer);

            // Ajout des autres couches
            const layers = initial.layers;

            const gfiLayers: object[] = [];
            layers.forEach((layer) => {
                addLayer(layer);
                if (gfinfo) {
                    gfiLayers.push({ obj: layer });
                }
            });
            // NOTE : il me semble que ce n'est plus nécessaire et plus possible sur geopf-ext-ol, à vérifier
            // getControl("GetFeatureInfo")?.setLayers(gfiLayers);

            // On zoom sur l'extent de la couche au premier rendu
            if (extent) {
                mapRef.current?.getView().fit(extent);
            }
        })();
    }, [gfinfo, bkLayer, extent, initial.layers, addLayer]);

    useEffect(() => {
        if (!capabilities) return;

        const wmtsOptions = optionsFromCapabilities(capabilities, {
            layer: olDefaults.default_background_layer,
        });

        if (wmtsOptions) {
            const capLayer = capabilities?.Contents.Layer?.find((l) => {
                return l.Identifier === olDefaults.default_background_layer;
            });

            bkLayer.setSource(new WMTS(wmtsOptions));
            bkLayer.set("name", capLayer?.Identifier);
            bkLayer.set("title", capLayer?.Title);
        }
    }, [capabilities, bkLayer]);

    useEffect(() => {
        getWorkingLayers().forEach((layer) => StyleHelper.applyStyle(layer, currentStyle));
    }, [currentStyle, getWorkingLayers]);

    return <div className={"map-view"} ref={mapTargetRef} />;
};

export default RMap;
