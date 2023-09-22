import { fr } from "@codegouvfr/react-dsfr";
import { FC, useEffect, useRef, useState } from "react";

// Openlayers
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
// import TileSourceType from "ol/source/Tile"
import { fromLonLat } from "ol/proj";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import useCapabilities from "../../hooks/useCapabilities";
import "./../../sass/components/zoom-range.scss";
import RangeSlider from "./RangeSlider";

type ZoomRangeProps = {
    min?: number;
    max?: number;
    initialValues?: number[];
    center?: number[];
    onChange?: (values: number[]) => void;
};

const ZoomRange: FC<ZoomRangeProps> = (props) => {
    const { data: capabilities } = useCapabilities();

    const { min = 0, max = 20, initialValues = [0, 20], center = [2.35, 48.85], onChange = null } = props;
    const minZoom = Math.max(min, initialValues[0]),
        maxZoom = Math.min(max, initialValues[1]);

    const [values, setValues] = useState([minZoom, maxZoom]);

    // References sur les deux cartes
    const leftMapRef = useRef<Map>();
    const leftMapTargetRef = useRef<HTMLDivElement>(null);

    const rightMapRef = useRef<Map>();
    const rightMapTargetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const viewOptions = {
            projection: "EPSG:3857",
            center: fromLonLat(center),
        };

        if (!leftMapRef.current) {
            leftMapRef.current = new Map({
                view: new View({ ...viewOptions, zoom: values[0] }),
                interactions: [],
                controls: [],
            });
            rightMapRef.current = new Map({
                view: new View({ ...viewOptions, zoom: values[1] }),
                interactions: [],
                controls: [],
            });
        }

        leftMapRef.current?.setTarget(leftMapTargetRef.current ?? "");
        rightMapRef.current?.setTarget(rightMapTargetRef.current ?? "");

        /* We set map target to undefined to represent a
         * nonexistent HTML element ID, when the React component is unmounted.
         * This prevents multiple maps being added to the map container on a
         * re-render.
         */
        return () => {
            leftMapRef.current?.setTarget(undefined);
            rightMapRef.current?.setTarget(undefined);
        };
    }, [center, values]);

    useEffect(() => {
        const getTileLayer = (wmtsOptions) => {
            return new TileLayer({
                opacity: 1,
                source: new WMTS(wmtsOptions),
            });
        };

        if (capabilities) {
            const wmtsOptions = optionsFromCapabilities(capabilities, {
                layer: "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2",
            });

            if (wmtsOptions) {
                leftMapRef.current?.addLayer(getTileLayer(wmtsOptions));
                rightMapRef.current?.addLayer(getTileLayer(wmtsOptions));
            }
        }
    }, [capabilities]);

    const handleOnChange = (v: number[]) => {
        leftMapRef.current?.getView().setZoom(v[0]);
        rightMapRef.current?.getView().setZoom(v[1]);
        setValues(v);
        onChange?.(v);
    };

    return (
        <div className={fr.cx("fr-my-2v")}>
            <div className="ui-map-zoom-levels">
                <div ref={leftMapTargetRef} className="ui-top-zoom-level" />
                <div ref={rightMapTargetRef} className="ui-bottom-zoom-level" />
            </div>
            <RangeSlider min={min} max={max} initialValues={[minZoom, maxZoom]} onChange={handleOnChange} />
        </div>
    );
};

export default ZoomRange;
