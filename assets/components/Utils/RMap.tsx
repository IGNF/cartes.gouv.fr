// import GetFeatureInfo from "geopf-extensions-openlayers/src/packages/Controls/GetFeatureInfo/GetFeatureInfo";
import LayerSwitcher from "geopf-extensions-openlayers/src/packages/Controls/LayerSwitcher/LayerSwitcher";
import SearchEngine from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/SearchEngine";
import GeoportalZoom from "geopf-extensions-openlayers/src/packages/Controls/Zoom/GeoportalZoom";
import { ScaleLine } from "ol/control";
import Attribution from "ol/control/Attribution";
import BaseLayer from "ol/layer/Base";
import { fromLonLat } from "ol/proj";
import { FC, useMemo } from "react";

import type { CartesStyle, GeostylerStyles } from "../../@types/app";
import { BoundingBox, OfferingDetailResponseDtoTypeEnum } from "../../@types/entrepot";
import { MapProvider } from "../../contexts/MapContext";
import olDefaults from "../../data/ol-defaults.json";
import useBboxFit from "../../hooks/useBboxFit";
import useOlMap from "../../hooks/useOlMap";
import MapViewLogger from "./MapViewLogger";
import OlBackgroundLayer from "./OlBackgroundLayer";
import OlControl from "./OlControl";
import OlControlFactory from "./OlControlFactory";
import OlLayer from "./OlLayer";
import TempButtonControl from "./TempButtonControl";
import TempDragRotateInteraction from "./TempDragRotateInteraction";

import "ol/ol.css";

import "geopf-extensions-openlayers/css/Dsfr.css";

import "../../sass/components/geopf-ext-ol-custom.scss";
import "../../sass/components/map-view.scss";

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

    const { map, targetRef } = useOlMap({
        view: {
            projection: olDefaults.projection,
            center: fromLonLat(olDefaults.center),
            zoom: olDefaults.zoom,
        },
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

            <OlControlFactory factory={() => new GeoportalZoom({ position: "top-left" })} />
            <OlControlFactory factory={() => new Attribution({ collapsible: true, collapsed: true })} />
            <OlControl control={layerSwitcherControl} />
            <OlControlFactory factory={() => new ScaleLine()} />
            <OlControlFactory
                factory={() =>
                    new SearchEngine({
                        collapsed: false,
                        apiKey: "essentiels",
                        zoomTo: "auto",
                    })
                }
            />
            <OlBackgroundLayer />

            {layers.map((layer, i) => {
                const key = (layer.get && (layer.get("id") ?? layer.get("name") ?? layer.get("title"))) ?? i;
                return <OlLayer key={String(key)} layer={layer} style={currentStyle} />;
            })}

            <div className={"map-view"} ref={targetRef} />
        </MapProvider>
    );
};

export default RMap;
