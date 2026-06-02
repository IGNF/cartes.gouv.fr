import { Feature, MapEvent } from "ol";
import { ScaleLine } from "ol/control";
import { Coordinate } from "ol/coordinate";
import Point from "ol/geom/Point";
import { DragPan, MouseWheelZoom } from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
import { unByKey } from "ol/Observable";
import { fromLonLat, toLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";
import { CSSProperties, FC, useEffect, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";

import type { ZoomAndCenteringFormType } from "../../../../../@types/app_espaceco";
import usePlanIgnWmtsLayer from "@/components/Map/usePlanIgnWmtsLayer";
import OlControl from "@/components/Map/OlControl";
import OlInteraction from "@/components/Map/OlInteraction";
import OlLayer from "@/components/Map/OlLayer";
import { OlMapProvider } from "@/components/Map/OlMapContext";
import { useOlMap } from "@/components/Map/useOlMap";
import olDefaults from "../../../../../data/ol-defaults.json";
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
    const { watch, getValues: getFormValues } = form;

    const position = watch("position");
    const position3857 = useMemo(() => fromLonLat(position), [position]);

    const extent = watch("extent");
    const minZoom = watch("minZoom");
    const maxZoom = watch("maxZoom");

    const { map, targetRef } = useOlMap({
        initialView: {
            projection: olDefaults.projection,
            center: fromLonLat(getFormValues("position")),
            zoom: getFormValues("zoom"),
            minZoom,
            maxZoom,
        },
        defaultControls: true,
        defaultInteractions: false,
    });

    const scaleLine = useMemo(() => new ScaleLine(), []);
    const displayCenter = useMemo(() => new DisplayCenterControl({}), []);
    const dragPan = useMemo(() => new DragPan(), []);
    const mouseWheelZoom = useMemo(() => new MouseWheelZoom({ useAnchor: false }), []);

    const planIgnLayer = usePlanIgnWmtsLayer();

    // Couche vecteur punaise — créée une seule fois, géométrie mise à jour par effet
    const punaiseFeature = useMemo(() => new Feature<Point>(), []);
    const punaiseLayer = useMemo(
        () =>
            new VectorLayer({
                source: new VectorSource({ features: [punaiseFeature] }),
                style: new Style({
                    image: new Icon({
                        src: punaise,
                        anchor: [0.5, 0],
                        anchorOrigin: "bottom-left",
                    }),
                }),
            }),
        [punaiseFeature]
    );

    useEffect(() => {
        punaiseFeature.setGeometry(new Point(position3857));
    }, [punaiseFeature, position3857]);

    // Propagation de minZoom / maxZoom à la vue
    useEffect(() => {
        if (!map) return;
        const view = map.getView();
        view.setMinZoom(minZoom);
        view.setMaxZoom(maxZoom);
    }, [map, minZoom, maxZoom]);

    // Recentrage de la vue sur changement externe de position (ex. : composant Search)
    // Garde anti-boucle : ne setCenter que si le centre actuel s'écarte de plus d'1 unité
    useEffect(() => {
        if (!map) return;
        const view = map.getView();
        const currentCenter = view.getCenter();
        if (!currentCenter) return;
        if (Math.abs(currentCenter[0] - position3857[0]) > 1 && Math.abs(currentCenter[1] - position3857[1]) > 1) {
            view.setCenter(position3857);
        }
    }, [map, position3857]);

    // Listeners moveend et postrender
    useEffect(() => {
        if (!map) return;

        const moveKey = map.on("moveend", (e) => {
            const view = e.map.getView();
            const centerView = view.getCenter() as Coordinate;
            const z = view.getZoom() as number;

            if (z !== getFormValues("zoom")) {
                onZoomChanged(Math.round(z));
            }

            if (Math.abs(centerView[0] - position3857[0]) > 1 && Math.abs(centerView[1] - position3857[1]) > 1) {
                onPositionChanged(toLonLat(centerView));
            }
        });

        const renderKey = map.on("postrender", (e) => drawExtent(e as MapEvent, extent ?? []));

        return () => {
            unByKey(moveKey);
            unByKey(renderKey);
        };
    }, [map, position3857, extent, getFormValues, onPositionChanged, onZoomChanged]);

    return (
        <OlMapProvider map={map}>
            <OlControl control={scaleLine} />
            <OlControl control={displayCenter} />
            <OlInteraction interaction={dragPan} />
            <OlInteraction interaction={mouseWheelZoom} />
            {planIgnLayer && <OlLayer layer={planIgnLayer} />}
            <OlLayer layer={punaiseLayer} />
            <div ref={targetRef} style={mapStyle} />
        </OlMapProvider>
    );
};

export default RMap;
