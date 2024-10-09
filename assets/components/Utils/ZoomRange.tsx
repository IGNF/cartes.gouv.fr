import { fr } from "@codegouvfr/react-dsfr";
import Range, { RangeProps } from "@codegouvfr/react-dsfr/Range";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import Map, { type MapOptions } from "ol/Map";
import View, { ViewOptions } from "ol/View";
import { ScaleLine } from "ol/control";
import BaseLayer from "ol/layer/Base";
import TileLayer from "ol/layer/Tile";
import { fromLonLat } from "ol/proj";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import { FC, memo, ReactNode, useCallback, useEffect, useRef } from "react";
import { symToStr } from "tsafe/symToStr";
import { tss } from "tss-react";

import olDefaults from "../../data/ol-defaults.json";
import useCapabilities from "../../hooks/useCapabilities";

import imgMapZoomBottom from "../../img/zoom-range/map-zoom-bottom.png";
import imgMapZoomTop from "../../img/zoom-range/map-zoom-top.png";

type ZoomRangeProps = {
    min: RangeProps["min"];
    max: RangeProps["min"];
    values: number[];
    onChange: (values: number[]) => void;
    step?: RangeProps["step"];
    center?: number[];
    mode?: "top" | "bottom" | "both";
    overlayContent?: ReactNode;
};

const ZoomRange: FC<ZoomRangeProps> = (props) => {
    const { data: capabilities } = useCapabilities();

    const { min, max, values, center = olDefaults.center, onChange, step, mode = "both", overlayContent } = props;

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

    const handleChange = useCallback(
        (newValue: number, zoomType?: "top" | "bottom") => {
            switch (zoomType) {
                case "top":
                    onChange([newValue, values[1]]);
                    break;
                case "bottom":
                    onChange([values[0], newValue]);
                    break;
                default:
                    onChange([newValue]);
                    break;
            }
        },
        [onChange, values]
    );

    const { classes } = useStyles();

    return (
        <div className={fr.cx("fr-my-2v")}>
            <div className={fr.cx("fr-grid-row")}>
                {(mode === "both" || mode === "top") && (
                    <div className={fr.cx("fr-col", "fr-px-2v")}>
                        <div ref={leftMapTargetRef} className={cx(classes.map)} />
                    </div>
                )}

                {mode !== "both" && (
                    <div className={cx(fr.cx("fr-col", "fr-px-2v"))}>
                        <div className={cx(classes.falseMapRoot)}>
                            <img src={mode === "top" ? imgMapZoomBottom : imgMapZoomTop} className={cx(classes.map, classes.falseMapImg)} />
                            <div className={cx(classes.falseMapOverlay)}>
                                {overlayContent && <div className={cx(fr.cx("fr-m-4v", "fr-p-2v"), classes.falseMapOverlayContent)}>{overlayContent}</div>}
                            </div>
                        </div>
                    </div>
                )}

                {(mode === "both" || mode === "bottom") && (
                    <div className={fr.cx("fr-col", "fr-px-2v")}>
                        <div ref={rightMapTargetRef} className={cx(classes.map)} />
                    </div>
                )}
            </div>
            <Range
                label=" "
                min={min}
                max={max}
                small={true}
                step={step}
                {...(() => {
                    switch (mode) {
                        case "top":
                            return {
                                nativeInputProps: {
                                    value: values?.[0] ?? min,
                                    onChange: (e) => {
                                        handleChange(e.currentTarget.valueAsNumber);
                                    },
                                },
                            };
                        case "bottom":
                            return {
                                nativeInputProps: {
                                    value: values?.[0] ?? max,
                                    onChange: (e) => {
                                        handleChange(e.currentTarget.valueAsNumber);
                                    },
                                },
                            };
                        case "both":
                            return {
                                double: true,
                                nativeInputProps: [
                                    {
                                        value: values?.[0] ?? min,
                                        onChange: (e) => {
                                            handleChange(e.currentTarget.valueAsNumber, "top");
                                        },
                                    },
                                    {
                                        value: values?.[1] ?? max,
                                        onChange: (e) => {
                                            handleChange(e.currentTarget.valueAsNumber, "bottom");
                                        },
                                    },
                                ],
                            };
                    }
                })()}
            />
        </div>
    );
};

ZoomRange.displayName = symToStr({ ZoomRange });

export default memo(ZoomRange);

const useStyles = tss.withName(ZoomRange.displayName).create(() => ({
    map: {
        height: "300px",
        width: "100%",
    },
    falseMapRoot: {
        position: "relative",
        display: "inline-block",
        width: "100%",
        height: "300px",
    },
    falseMapImg: {
        display: "block",
        width: "100%",
        height: "300px",
    },
    falseMapOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        textAlign: "center",
    },
    falseMapOverlayContent: {
        backgroundColor: fr.colors.decisions.background.default.grey.default,
        color: fr.colors.decisions.text.default.grey.default,
    },
}));
