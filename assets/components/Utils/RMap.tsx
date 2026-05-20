// import GetFeatureInfo from "geopf-extensions-openlayers/src/packages/Controls/GetFeatureInfo/GetFeatureInfo";
import LayerSwitcher from "geopf-extensions-openlayers/src/packages/Controls/LayerSwitcher/LayerSwitcher";
import SearchEngine from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/SearchEngine";
import GeoportalZoom from "geopf-extensions-openlayers/src/packages/Controls/Zoom/GeoportalZoom";
import { ScaleLine } from "ol/control";
import Attribution from "ol/control/Attribution";
import BaseLayer from "ol/layer/Base";
import { fromLonLat } from "ol/proj";
import { FC, useMemo } from "react";

import type { CartesStyle, GeostylerStyles, OfferingTypeEnum } from "../../@types/app";
import { BoundingBox } from "../../@types/entrepot";
import { MapProvider } from "../../contexts/MapContext";
import olDefaults from "../../data/ol-defaults.json";
import useBboxFit from "../../hooks/useBboxFit";
import useOlMap from "../../hooks/useOlMap";
import MapViewLogger from "./MapViewLogger";
import OlBackgroundLayer from "./OlBackgroundLayer";
import OlControl from "./OlControl";
import OlLayer from "./OlLayer";
import TempButtonControl from "./TempButtonControl";
import TempDragRotateInteraction from "./TempDragRotateInteraction";

import "ol/ol.css";

import "geopf-extensions-openlayers/css/Dsfr.css";

import "../../sass/components/geopf-ext-ol-custom.scss";
import "../../sass/components/map-view.scss";

export interface RMapProps {
    /** TODO: utilisé pour activer GetFeatureInfo selon le type d'offering (cf. bloc commenté ci-dessous). */
    type: OfferingTypeEnum;
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

    const zoomControl = useMemo(() => new GeoportalZoom({ position: "top-left" }), []);
    const attribution = useMemo(() => new Attribution({ collapsible: true, collapsed: true }), []);
    const layerSwitcher = useMemo(
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
    const scaleLine = useMemo(() => new ScaleLine(), []);
    const searchEngine = useMemo(
        () =>
            new SearchEngine({
                collapsed: false,
                apiKey: "essentiels",
                zoomTo: "auto",
                displayButtonAdvancedSearch: true,
                displayButtonGeolocate: true,
            }),
        []
    );

    const { map, targetRef } = useOlMap({
        initialView: {
            projection: olDefaults.projection,
            center: fromLonLat(olDefaults.center),
            zoom: olDefaults.zoom,
        },
        defaultControls: false,
    });

    useBboxFit(map, bbox);

    return (
        <MapProvider map={map}>
            {import.meta.env.MODE === "development" && (
                <>
                    <MapViewLogger />
                    <TempButtonControl />
                    <TempDragRotateInteraction />
                </>
            )}

            <OlControl control={zoomControl} />
            <OlControl control={attribution} />
            <OlControl control={layerSwitcher} />
            <OlControl control={scaleLine} />
            <OlControl control={searchEngine} />
            <OlBackgroundLayer />

            {layers.map((layer, i) => {
                const key = layer.get("name") ?? layer.get("title") ?? i;
                return <OlLayer key={String(key)} layer={layer} style={currentStyle} />;
            })}

            <div className={"map-view"} ref={targetRef} />
        </MapProvider>
    );
};

export default RMap;
