import { FC, useEffect, useRef, useState } from "react";
import View from "ol/View";
import { fromLonLat } from "ol/proj";
import MouseWheelZoom from "ol/interaction/MouseWheelZoom";
import { defaults as defaultControls } from "ol/control";
import ScaleLine from "ol/control/ScaleLine";
import SearchEngine from "geoportal-extensions-openlayers/src/OpenLayers/Controls/SearchEngine";
import DragPan from "ol/interaction/DragPan";
import "ol/ol.css";
import "geoportal-extensions-openlayers/dist/GpPluginOpenLayers.css";
import "../../../../sass/components/map-view.scss";

import useCapabilities from "../../../../hooks/useCapabilities";
import SampleMap from "./SampleMap";
import { UseFormReturn } from "react-hook-form";
import { fr } from "@codegouvfr/react-dsfr";

type ZoomLevelType = Record<string, number[]>;

type RCSampleMapProps = {
    visible: boolean;
    form: UseFormReturn;
    center?: number[];
    onChange?: (extent: number[]) => void;
};

const RCSampleMap: FC<RCSampleMapProps> = ({ visible, form, center = [2.35, 48.85], onChange }) => {
    const mapTargetRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<SampleMap>();

    const { data: capabilities } = useCapabilities();

    const { watch } = form;
    const zoomLevels: ZoomLevelType = watch("table_zoom_levels");

    useEffect(() => {
        if (mapRef.current && mapTargetRef.current) {
            if (zoomLevels !== undefined && Object.keys(zoomLevels).length) {
                let level = -1;
                Object.values(zoomLevels).forEach((levels) => {
                    if (levels[1] > level) level = levels[1];
                });
                mapRef.current.setBottomLevel(level);
            }
        }
    }, [zoomLevels]);

    useEffect(() => {
        // Creation de la carte
        if (!mapRef.current) {
            // Controles par defaut
            const controls = defaultControls({
                attribution: false,
                rotate: false,
                zoom: true,
            });
            controls.push(new ScaleLine());
            controls.push(
                new SearchEngine({
                    collapsed: false,
                    displayAdvancedSearch: false,
                    displayMarker: false,
                    apiKey: "essentiels",
                    zoomTo: "auto",
                })
            );

            mapRef.current = new SampleMap({
                view: new View({
                    center: fromLonLat(center),
                    zoom: 18,
                }),
                interactions: [new DragPan(), new MouseWheelZoom({ useAnchor: false })],
                controls: controls,
            });

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            mapRef.current.on("extentchanged", (e) => {
                onChange?.(e.extent);
            });
        }

        mapRef.current.setTarget(mapTargetRef.current || "");

        return () => mapRef.current?.setTarget(undefined);
    }, [center, onChange]);

    useEffect(() => {
        if (capabilities && mapRef.current) {
            mapRef.current.addBackgroundLayer(capabilities);
        }
    }, [capabilities]);

    return (
        <div className={fr.cx("fr-my-2v", !visible && "fr-hidden")}>
            <div className={"map-view"} ref={mapTargetRef} />;
        </div>
    );
};

export default RCSampleMap;
