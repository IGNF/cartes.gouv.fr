import { fr } from "@codegouvfr/react-dsfr";
import SearchEngine from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/SearchEngine";
import GeoportalZoom from "geopf-extensions-openlayers/src/packages/Controls/Zoom/GeoportalZoom";
import View from "ol/View";
import ScaleLine from "ol/control/ScaleLine";
import DragPan from "ol/interaction/DragPan";
import MouseWheelZoom from "ol/interaction/MouseWheelZoom";
import { fromLonLat } from "ol/proj";
import { FC, useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";

import useCapabilities from "../../../../../hooks/useCapabilities";
import Translator from "../../../../../modules/Translator";
import SampleMap from "./SampleMap";

import "ol/ol.css";

import "../../../../../sass/components/map-view.scss";

type RCSampleMapProps = {
    form: UseFormReturn;
    center: number[];
    bottomZoomLevel?: number;
    onChange: (center: number[], area: string) => void;
};

const RCSampleMap: FC<RCSampleMapProps> = ({ form, center, bottomZoomLevel, onChange }) => {
    const mapTargetRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<SampleMap>();

    const { data: capabilities } = useCapabilities();
    const { getValues: getFormValues } = form;

    useEffect(() => {
        // Creation de la carte
        if (!mapRef.current) {
            // Controles par defaut
            const controls = [
                new GeoportalZoom(),
                new ScaleLine(),
                new SearchEngine({
                    collapsed: false,
                    displayAdvancedSearch: false,
                    displayMarker: false,
                    apiKey: "essentiels",
                    zoomTo: "auto",
                }),
            ];

            mapRef.current = new SampleMap({
                view: new View({
                    center: fromLonLat(center),
                    zoom: bottomZoomLevel,
                }),
                interactions: [new DragPan(), new MouseWheelZoom({ useAnchor: false })],
                controls: controls,
            });

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            mapRef.current.on("extentchanged", (e) => {
                onChange?.(e.center, e.area);
            });
        }

        mapRef.current.setTarget(mapTargetRef.current || "");

        return () => mapRef.current?.setTarget(undefined);
    }, [center, bottomZoomLevel, getFormValues, onChange]);

    useEffect(() => {
        if (capabilities && mapRef.current) {
            mapRef.current.addBackgroundLayer(capabilities);
        }
    }, [capabilities]);

    return (
        <div className={fr.cx("fr-grid-row")}>
            <p className={fr.cx("fr-mb-1w")}>{Translator.trans("pyramid_vector.new.step_sample.sample_explain")}</p>
            <div className={fr.cx("fr-col-12", "fr-col-md-12")}>
                <div className={"map-view"} ref={mapTargetRef} />
            </div>
        </div>
    );
};

export default RCSampleMap;
