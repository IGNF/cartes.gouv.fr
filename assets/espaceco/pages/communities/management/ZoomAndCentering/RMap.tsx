import { Feature, MapEvent } from "ol";
import { defaults as defaultControls, ScaleLine } from "ol/control";
import { Coordinate } from "ol/coordinate";
import Point from "ol/geom/Point";
import { DragPan, MouseWheelZoom } from "ol/interaction";
import BaseLayer from "ol/layer/Base";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Map from "ol/Map";
import { fromLonLat, toLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";
import View from "ol/View";
import { CSSProperties, FC, useCallback, useEffect, useMemo, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { ZoomAndCenteringFormType } from "../../../../../@types/app_espaceco";
import olDefaults from "../../../../../data/ol-defaults.json";
import useCapabilities from "../../../../../hooks/useCapabilities";
import punaise from "../../../../../img/punaise.png";
import DisplayCenterControl from "../../../../../ol/controls/DisplayCenterControl";
import drawExtent from "../../../../../ol/drawextent";

const mapStyle: CSSProperties = {
    height: "400px",
};

type RMapProps = {
    form: UseFormReturn<ZoomAndCenteringFormType>;
    onPositionChanged: (position: Coordinate) => void;
    onZoomChanged: (zoom: number) => void;
};

const RMap: FC<RMapProps> = ({ form, onPositionChanged, onZoomChanged }) => {
    const mapTargetRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map>();

    // Création de la couche openlayers de fond (bg layer)
    const { data: capabilities } = useCapabilities();

    const { watch, getValues: getFormValues } = form;

    const position = watch("position");
    const position3857 = useMemo(() => fromLonLat(position), [position]);

    const extent = watch("extent");
    const renderExtent = useCallback((e: MapEvent) => drawExtent(e, extent), [extent]);

    // Création de la carte une fois bg layer créée
    useEffect(() => {
        if (!capabilities) return;

        const feature = new Feature(new Point(position3857));

        // layer punaise
        const source = new VectorSource();
        source.addFeatures([feature]);
        const layer = new VectorLayer({
            source: source,
            style: new Style({
                image: new Icon({
                    src: punaise,
                    // ancrage de la punaise (non centrée)
                    anchor: [0.5, 0],
                    anchorOrigin: "bottom-left",
                }),
            }),
        });

        const layers: BaseLayer[] = [];

        const wmtsOptions = optionsFromCapabilities(capabilities, {
            layer: olDefaults.default_background_layer,
        });
        if (wmtsOptions) {
            const bkgLayer = new TileLayer({
                source: new WMTS(wmtsOptions),
            });
            layers.push(bkgLayer);
        }
        layers.push(layer);

        mapRef.current = new Map({
            target: mapTargetRef.current as HTMLElement,
            layers: layers,
            controls: defaultControls().extend([new ScaleLine(), new DisplayCenterControl({})]),
            interactions: [
                new DragPan(),
                new MouseWheelZoom({
                    useAnchor: false,
                }),
            ],
            view: new View({
                center: position3857,
                zoom: getFormValues("zoom"),
                minZoom: getFormValues("zoomMin"),
                maxZoom: getFormValues("zoomMax"),
            }),
        });

        mapRef.current.on("moveend", (e) => {
            const map = e.map;
            const centerView = map.getView().getCenter() as Coordinate;
            const z = map.getView().getZoom() as number;

            if (z !== getFormValues("zoom")) {
                onZoomChanged(Math.round(z));
            }

            if (Math.abs(centerView[0] - position3857[0]) > 1 && Math.abs(centerView[1] - position3857[1]) > 1) {
                onPositionChanged(toLonLat(centerView));
            }
        });

        mapRef.current.on("postrender", (e) => renderExtent(e));

        return () => mapRef.current?.setTarget(undefined);
    }, [capabilities, position3857, getFormValues, onPositionChanged, onZoomChanged, renderExtent]);

    return <div ref={mapTargetRef} style={mapStyle} />;
};

export default RMap;
