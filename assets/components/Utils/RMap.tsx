// import GetFeatureInfo from "geopf-extensions-openlayers/src/packages/Controls/GetFeatureInfo/GetFeatureInfo";
import LayerSwitcher from "geopf-extensions-openlayers/src/packages/Controls/LayerSwitcher/LayerSwitcher";
import SearchEngine from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/SearchEngine";
import GeoportalZoom from "geopf-extensions-openlayers/src/packages/Controls/Zoom/GeoportalZoom";
import { ScaleLine } from "ol/control";
import Attribution from "ol/control/Attribution";
import BaseLayer from "ol/layer/Base";
import type OlLayer from "ol/layer/Layer";
import { fromLonLat } from "ol/proj";
import { FC, useEffect, useMemo } from "react";

import type { CartesStyle, GeostylerStyles } from "../../@types/app";
import { BoundingBox, OfferingDetailResponseDtoTypeEnum } from "../../@types/entrepot";
import olDefaults from "../../data/ol-defaults.json";
import useCapabilities from "../../hooks/useCapabilities";
import StyleHelper from "../../modules/Style/StyleHelper";
import useOlMap from "../../hooks/useOlMap";
import useBackgroundWmts from "../../hooks/useBackgroundWmts";
import useBboxFit from "../../hooks/useBboxFit";
import { MapProvider } from "../../contexts/MapContext";
import MapViewLogger from "./MapViewLogger";
import TempButtonControl from "./TempButtonControl";

import "ol/ol.css";

import "geopf-extensions-openlayers/css/Dsfr.css";

import "../../sass/components/geopf-ext-ol-custom.scss";
import "../../sass/components/map-view.scss";

function getWorkingLayers(layers: BaseLayer[]): BaseLayer[] {
    return layers.filter((l) => l.get("name") !== olDefaults.default_background_layer);
}

export interface RMapProps {
    type: OfferingDetailResponseDtoTypeEnum;
    bbox?: BoundingBox;
    currentStyle?: CartesStyle | GeostylerStyles;
    layers: BaseLayer[];
}

const RMap: FC<RMapProps> = ({ layers, currentStyle, bbox }) => {
    // const gfinfo = useMemo(() => {
    //     return [OfferingDetailResponseDtoTypeEnum.WFS, OfferingDetailResponseDtoTypeEnum.WMSVECTOR, OfferingDetailResponseDtoTypeEnum.WMTSTMS].includes(
    //         initial.type
    //     );
    // }, [initial.type]);

    const layerSwitcherControl = useMemo(
        () =>
            new LayerSwitcher({
                options: {
                    position: "top-right",
                    collapsed: true,
                    panel: true,
                    counter: true,
                },
            }),
        []
    );
    const controls = useMemo(
        () => [
            new GeoportalZoom({ position: "top-left" }),
            new Attribution({ collapsible: true, collapsed: true }),
            layerSwitcherControl,
            new ScaleLine(),
            new SearchEngine({
                collapsed: false,
                apiKey: "essentiels",
                zoomTo: "auto",
            }),
        ],
        [layerSwitcherControl]
    );

    const { data: capabilities } = useCapabilities();

    const { map, targetRef } = useOlMap({
        view: {
            projection: olDefaults.projection,
            center: fromLonLat(olDefaults.center),
            zoom: olDefaults.zoom,
        },
        controls,
    });

    /**
     * Ajout et suppression des couches + synchronisation LayerSwitcher
     */

    // Bind bbox fit
    useBboxFit(map, bbox);

    useEffect(() => {
        if (!map) return;
        // Supprimer toutes les couches sauf le fond de carte, puis ajouter les nouvelles couches
        const layersCollection = map.getLayers?.();
        if (!layersCollection) return;
        const existing = layersCollection.getArray();
        getWorkingLayers(existing).forEach((l) => {
            map.removeLayer(l);

            // TODO : peut-être inutile ?
            const ls = layerSwitcherControl as unknown as {
                removeLayer?: (layer: OlLayer) => void;
                getMap?: () => unknown;
            };
            if (ls.getMap?.()) {
                ls.removeLayer?.(l as unknown as OlLayer);
            }
        });

        layers.forEach((layer) => {
            if (currentStyle) {
                StyleHelper.applyStyle(layer, currentStyle);
            }
            map.addLayer(layer);
            const ls = layerSwitcherControl as unknown as {
                addLayer?: (layer: OlLayer, options?: { title?: string; description?: string }) => void;
                getMap?: () => unknown;
            };
            if (ls.getMap?.()) {
                ls.addLayer?.(layer as unknown as OlLayer, {
                    title: layer.get("title"),
                    description: layer.get("abstract"),
                });
            }
        });
    }, [map, layers, currentStyle, layerSwitcherControl]);

    useBackgroundWmts(map, capabilities, olDefaults.default_background_layer);

    useEffect(() => {
        if (!map) return;
        const layersCollection = map.getLayers?.();
        if (!layersCollection) return;
        const arr: BaseLayer[] = layersCollection.getArray();
        getWorkingLayers(arr).forEach((layer) => StyleHelper.applyStyle(layer, currentStyle));
    }, [map, currentStyle]);

    return (
        <MapProvider map={map}>
            {import.meta.env.MODE === "development" && (
                <>
                    <MapViewLogger />
                    <TempButtonControl />
                </>
            )}
            <div className={"map-view"} ref={targetRef} role="region" aria-label="Map" />
        </MapProvider>
    );
};

export default RMap;
