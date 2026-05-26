import { fr } from "@codegouvfr/react-dsfr";
import { Range } from "@codegouvfr/react-dsfr/Range";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { ScaleLine } from "ol/control";
import { fromLonLat } from "ol/proj";
import { FC, memo, ReactNode, useEffect, useMemo } from "react";

import OlControl from "@/components/Map/OlControl";
import OlLayer from "@/components/Map/OlLayer";
import usePlanIgnWmtsLayer from "@/components/Map/usePlanIgnWmtsLayer";
import { OlMapProvider } from "@/components/Map/OlMapContext";
import useOlMap from "@/components/Map/useOlMap";
import olDefaults from "../../data/ol-defaults.json";

import "ol/ol.css";

import "../../sass/components/zoom-range.scss";

type MiniZoomMapProps = {
    zoomLevel: number;
    center: number[];
    className: string;
};

const MiniZoomMap: FC<MiniZoomMapProps> = ({ zoomLevel, center, className }) => {
    const scaleLine = useMemo(() => new ScaleLine(), []);

    const { map, targetRef } = useOlMap({
        initialView: {
            projection: olDefaults.projection,
            center: fromLonLat(center),
            zoom: zoomLevel,
        },
        defaultControls: false,
        defaultInteractions: false,
    });

    const planIgnLayer = usePlanIgnWmtsLayer();

    useEffect(() => {
        if (!map) return;
        map.getView().setZoom(zoomLevel);
        map.updateSize();
    }, [map, zoomLevel]);

    return (
        <OlMapProvider map={map}>
            <OlControl control={scaleLine} />
            {planIgnLayer && <OlLayer layer={planIgnLayer} />}
            <div ref={targetRef} className={className} />
        </OlMapProvider>
    );
};

type ZoomRangeProps = {
    label?: ReactNode;
    hintText?: ReactNode;
    min: number;
    max: number;
    small?: boolean;
    disableSlider?: true;
    values: number[];
    onChange: (values: number[]) => void;
    center?: number[];
};

const ZoomRange: FC<ZoomRangeProps> = (props) => {
    const { label, hintText, min, max, disableSlider, values, onChange, small = false, center = olDefaults.center } = props;

    return (
        <div className={fr.cx("fr-my-2v")}>
            {label && (
                <label className={fr.cx("fr-label")}>
                    {label}
                    {hintText && <span className={"fr-hint-text"}>{hintText}</span>}
                </label>
            )}
            <div className="frx-zoom-range">
                <MiniZoomMap zoomLevel={values[0]} center={center} className={cx("frx-top-zoom", small && "frx-zoom-range-sm")} />
                <MiniZoomMap zoomLevel={values[1]} center={center} className={cx("frx-bottom-zoom", small && "frx-zoom-range-sm")} />
            </div>
            <Range
                label={null}
                min={min}
                max={max}
                disabled={disableSlider}
                double
                small
                step={1}
                nativeInputProps={[
                    {
                        value: values[0],
                        onChange: (e) => {
                            const v = [...values];
                            v[0] = Number(e.currentTarget.value);
                            onChange(v);
                        },
                    },
                    {
                        value: values[1],
                        onChange: (e) => {
                            const v = [...values];
                            v[1] = Number(e.currentTarget.value);
                            onChange(v);
                        },
                    },
                ]}
            />
        </div>
    );
};

export default memo(ZoomRange);
