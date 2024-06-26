import { fr } from "@codegouvfr/react-dsfr";
import Map from "ol/Map";
import { MapOptions } from "ol/PluggableMap";
import View, { ViewOptions } from "ol/View";
import { ScaleLine } from "ol/control";
import BaseLayer from "ol/layer/Base";
import TileLayer from "ol/layer/Tile";
import { fromLonLat } from "ol/proj";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import { FC, memo, useCallback, useEffect, useRef } from "react";

import olDefaults from "../../data/ol-defaults.json";
import useCapabilities from "../../hooks/useCapabilities";
import RangeSlider from "./RangeSlider";

import "ol/ol.css";

import "../../sass/components/zoom-range.scss";

type ZoomRangeProps = {
    min: number;
    max: number;
    values: number[];
    onChange: (values: number[]) => void;
    center?: number[];
};

const ZoomRange: FC<ZoomRangeProps> = (props) => {
    const { data: capabilities } = useCapabilities();

    const { min, max, values, center = olDefaults.center, onChange } = props;

    // References sur les deux cartes
    const leftMapRef = useRef<Map>();
    const leftMapTargetRef = useRef<HTMLDivElement>(null);

    const rightMapRef = useRef<Map>();
    const rightMapTargetRef = useRef<HTMLDivElement>(null);

    const getBgLayer = useCallback(() => {
        if (!capabilities) return;

        const wmtsOptions = optionsFromCapabilities(capabilities, {
            layer: olDefaults.default_background_layer,
        });

        if (!wmtsOptions) return;

        const bgLayer = new TileLayer();
        bgLayer.setSource(new WMTS(wmtsOptions));

        return bgLayer;
    }, [capabilities]);

    const getMapOptions = useCallback((bgLayer: BaseLayer) => {
        const controls = [new ScaleLine()];
        const mapOptions: MapOptions = {
            layers: [bgLayer],
            controls: controls,
            interactions: [],
        };
        return mapOptions;
    }, []);

    const getViewOptions = useCallback(
        (zoomLevel: number) => {
            const viewOptions: ViewOptions = {
                projection: olDefaults.projection,
                center: fromLonLat(center),
                zoom: zoomLevel,
            };
            return viewOptions;
        },
        [center]
    );

    const createMap = useCallback(
        (target: string | HTMLElement, zoomLevel: number) => {
            const bgLayer = getBgLayer();

            if (!bgLayer) return;

            return new Map({
                ...getMapOptions(bgLayer),
                target,
                view: new View(getViewOptions(zoomLevel)),
            });
        },
        [getBgLayer, getViewOptions, getMapOptions]
    );

    useEffect(() => {
        if (leftMapTargetRef.current) {
            leftMapRef.current = createMap(leftMapTargetRef.current, olDefaults.zoom_levels.TOP);
        }

        if (rightMapTargetRef.current) {
            rightMapRef.current = createMap(rightMapTargetRef.current, olDefaults.zoom_levels.BOTTOM);
        }

        return () => {
            leftMapRef.current?.setTarget(undefined);
            rightMapRef.current?.setTarget(undefined);
        };
    }, [createMap]);

    useEffect(() => {
        leftMapRef.current?.getView().setZoom(values[0]);
        rightMapRef.current?.getView().setZoom(values[1]);

        leftMapRef.current?.updateSize();
        rightMapRef.current?.updateSize();
    }, [values]);

    return (
        <div className={fr.cx("fr-my-2v")}>
            <div className="ui-map-zoom-levels">
                <div ref={leftMapTargetRef} className="ui-top-zoom-level" />
                <div ref={rightMapTargetRef} className="ui-bottom-zoom-level" />
            </div>
            <RangeSlider min={min} max={max} values={values} onChange={(newValues) => onChange(newValues)} />
        </div>
    );
};

export default memo(ZoomRange);
