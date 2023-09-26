import { FC, useEffect, useRef } from "react";
import View from "ol/View";
import { fromLonLat } from "ol/proj";
import MouseWheelZoom from "ol/interaction/MouseWheelZoom";
import { defaults as defaultControls } from "ol/control";
import ScaleLine from "ol/control/ScaleLine";
import SearchEngine from "geoportal-extensions-openlayers/src/OpenLayers/Controls/SearchEngine";
import DragPan from "ol/interaction/DragPan";
import useCapabilities from "../../../../hooks/useCapabilities";
import SampleMap from "./SampleMap";
import { UseFormReturn } from "react-hook-form";
import { fr } from "@codegouvfr/react-dsfr";

import "ol/ol.css";
import "geoportal-extensions-openlayers/dist/GpPluginOpenLayers.css";
import "../../../../sass/components/map-view.scss";
import "../../../../sass/components/ol.scss";

type RCSampleMapProps = {
    form: UseFormReturn;
    center?: number[];
    onChange?: (extent: number[]) => void;
};

const RCSampleMap: FC<RCSampleMapProps> = ({ form, center = [2.35, 48.85], onChange }) => {
    const mapTargetRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<SampleMap>();

    const { data: capabilities } = useCapabilities();
    const { getValues: getFormValues } = form;

    useEffect(() => {
        const getBottomZoomLevel = () => {
            const zoomLevels: Record<string, number[]> = getFormValues("table_zoom_levels");

            let level = -1;
            Object.values(zoomLevels).forEach((levels) => {
                if (levels[1] > level) level = levels[1];
            });
            return level;
        };

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
                    zoom: getBottomZoomLevel(),
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
    }, [center, getFormValues, onChange]);

    useEffect(() => {
        if (capabilities && mapRef.current && mapTargetRef.current) {
            mapRef.current.addBackgroundLayer(capabilities);
        }
    }, [capabilities]);

    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
            <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
                <div className={"map-view"} ref={mapTargetRef} />
            </div>
        </div>
    );
};

export default RCSampleMap;
