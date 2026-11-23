import DOMPurify from "dompurify";
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
import Layer from "ol/layer/Layer";
import TileLayer from "ol/layer/Tile";
import { fromLonLat, transformExtent } from "ol/proj";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import { FC, useEffect, useRef, useState } from "react";

import { type CartesStyle, type GeostylerStyles, OfferingTypeEnum } from "../../@types/app";
import { BoundingBox } from "../../@types/entrepot";
import olDefaults from "../../data/ol-defaults.json";
import useCapabilities from "../../hooks/useCapabilities";
import StyleHelper from "../../modules/Style/StyleHelper";

import "ol/ol.css";

import "geopf-extensions-openlayers/css/Dsfr.css";

import "../../sass/components/geopf-ext-ol-custom.scss";
import "../../sass/components/map-view.scss";

function getWorkingLayers(layers: BaseLayer[]): BaseLayer[] {
    return layers.filter((l) => l.get("name") !== olDefaults.default_background_layer);
}

const isBackgroundLayer = (layer: BaseLayer | undefined) => layer?.get("name") === olDefaults.default_background_layer;

const HTML_ENTITIES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

// titre et réponse insérés en HTML par la bibliothèque : échappés ou assainis ; fond de carte ignoré (source WMTS sans getFeatureInfoUrl)
class DataLayerGetFeatureInfo extends GetFeatureInfo {
    constructor() {
        // comme entree-carto : `position` place le panneau dans le conteneur des boutons (sinon .fr-modal du DSFR l’écrase) ; option absente des types
        super({ active: true, position: "top-left" } as ConstructorParameters<typeof GetFeatureInfo>[0]);
    }

    getLayerTitle(gfiLayer: Layer): string {
        return super.getLayerTitle(gfiLayer).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);
    }

    getGetFeatureInfoLayer(layer: Layer): unknown {
        return isBackgroundLayer(layer) ? { format: "unknown", layer } : super.getGetFeatureInfoLayer(layer);
    }

    // reçoit l’entrée du contrôle ({ layer, url… }), déclarée Layer par la bibliothèque
    getGetFeatureInfoContent(gfiLayer: Layer & { layer?: BaseLayer }): Promise<unknown> {
        if (isBackgroundLayer(gfiLayer.layer)) return Promise.resolve(null);
        return (super.getGetFeatureInfoContent(gfiLayer) as Promise<unknown>).then((content) =>
            typeof content === "string" ? DOMPurify.sanitize(content) : content
        );
    }
}

export interface RMapProps {
    type: OfferingTypeEnum;
    bbox?: BoundingBox;
    currentStyle?: CartesStyle | GeostylerStyles;
    layers: Layer[];
}

const RMap: FC<RMapProps> = ({ layers, currentStyle, bbox, type }) => {
    const mapTargetRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map | undefined>(undefined);
    // useState paresseux : instance unique, conservée par Fast Refresh (useMemo serait recalculé et détaché de la carte)
    // oxlint-disable-next-line react/hook-use-state
    const [layerSwitcherControl] = useState(
        () =>
            new LayerSwitcher({
                options: {
                    position: "top-right",
                    collapsed: true,
                    panel: true,
                    counter: true,
                },
            })
    );
    // oxlint-disable-next-line react/hook-use-state
    const [controls] = useState(() => [
        new GeoportalZoom({ position: "top-left" }),
        new Attribution({ collapsible: true, collapsed: true }),
        layerSwitcherControl,
        new ScaleLine(),
        new SearchEngine({
            collapsed: false,
            displayButtonAdvancedSearch: false,
            apiKey: "essentiels",
            zoomTo: "auto",
        }),
        // WMS vecteur seulement : le contrôle insère sans filtre le HTML des propriétés des couches vecteur (WFS, TMS)
        ...(type === OfferingTypeEnum.WMSVECTOR ? [new DataLayerGetFeatureInfo()] : []),
    ]);
    const bkLayer = useRef(new TileLayer({ properties: { title: null, description: null } }));

    const { data: capabilities } = useCapabilities();

    useEffect(() => {
        if (bbox === undefined) return;

        let extent = createOrUpdate(bbox.west, bbox.south, bbox.east, bbox.north);
        extent = transformExtent(extent, "EPSG:4326", olDefaults.projection);

        if (extent) {
            mapRef.current?.getView().fit(extent);
        }
    }, [bbox]);

    /**
     * Ajout de la couche dans la carte (+ dans le layerSwitcher)
     */
    const addLayer = (layer: Layer): void => {
        if (currentStyle) {
            void StyleHelper.applyStyle(layer, currentStyle);
        }
        // Ajout du layer dans la carte et dans le LayerSwitcher
        mapRef.current?.addLayer(layer);
        layerSwitcherControl.addLayer(layer, {
            title: layer.get("title") as string | undefined,
            description: layer.get("abstract") as string | undefined,
        });
    };

    useEffect(() => {
        // Creation de la carte
        if (!mapRef.current) {
            mapRef.current = new Map({
                view: new View({
                    projection: olDefaults.projection,
                    center: fromLonLat(olDefaults.center),
                    zoom: olDefaults.zoom,
                }),
                interactions: defaultInteractions(),
                controls,
            });
            mapRef.current?.on("loadstart", function () {
                mapRef.current?.getTargetElement()?.classList.add("spinner");
            });
            mapRef.current?.on("loadend", function () {
                mapRef.current?.getTargetElement()?.classList.remove("spinner");
            });
        }
        mapRef.current.setTarget(mapTargetRef.current || "");

        /* We set map target to undefined to represent a
         * nonexistent HTML element ID, when the React component is unmounted.
         * This prevents multiple maps being added to the map container on a
         * re-render.
         */
        return () => mapRef.current?.setTarget(undefined);
    }, [controls]);

    useEffect(() => {
        if (mapRef.current === undefined) return;

        // Suppression de tous les layers
        mapRef.current.getLayers().clear();

        // Ajout de la couche de fond PlanIgnV2
        addLayer(bkLayer.current);

        // Ajout des autres couches
        layers.forEach((layer) => {
            if (mapRef.current !== undefined) {
                addLayer(layer);
            }
        });

        // On zoom sur l'extent de la couche au premier rendu
        // if (extent) {
        //     mapRef.current?.getView().fit(extent);
        // }
        // addLayer
        if (bbox === undefined) return;

        let extent = createOrUpdate(bbox.west, bbox.south, bbox.east, bbox.north);
        extent = transformExtent(extent, "EPSG:4326", olDefaults.projection);

        if (extent) {
            mapRef.current?.getView().fit(extent);
        }

        // oxlint-disable-next-line react/exhaustive-deps
    }, [layers]);

    useEffect(() => {
        if (!capabilities) return;

        const wmtsOptions = optionsFromCapabilities(capabilities, {
            layer: olDefaults.default_background_layer,
        });

        if (wmtsOptions) {
            const capLayer = capabilities?.Contents.Layer?.find((l) => {
                return l.Identifier === olDefaults.default_background_layer;
            });

            bkLayer.current.setSource(new WMTS(wmtsOptions));
            bkLayer.current.set("name", capLayer?.Identifier);
            bkLayer.current.set("title", capLayer?.Title);
        }
    }, [capabilities]);

    useEffect(() => {
        const layers = mapRef.current?.getLayers().getArray() ?? [];
        getWorkingLayers(layers).forEach((layer) => void StyleHelper.applyStyle(layer, currentStyle));
    }, [currentStyle]);

    return <div className={"map-view"} ref={mapTargetRef} />;
};

export default RMap;
