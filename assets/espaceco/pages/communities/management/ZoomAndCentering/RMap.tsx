import { Feature } from "ol";
import { defaults as defaultControls, ScaleLine } from "ol/control";
import { Coordinate } from "ol/coordinate";
import Point from "ol/geom/Point";
import { DragPan, MouseWheelZoom } from "ol/interaction";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Map from "ol/Map";
import { fromLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";
import View from "ol/View";
import { CSSProperties, FC, useEffect, useMemo, useRef } from "react";
import olDefaults from "../../../../../data/ol-defaults.json";
import useCapabilities from "../../../../../hooks/useCapabilities";
import punaise from "../../../../../img/punaise.png";
import DisplayCenterControl from "../../../../../ol/controls/DisplayCenterControl";

const mapStyle: CSSProperties = {
    height: "400px",
};

type RMapProps = {
    position: Coordinate | null;
    // NOTE Supprimé car si la position n'est pas dans l'extent, le centre de la carte (position) est déplacé
    // extent?: Extent;
    zoom: number;
    zoomMin: number;
    zoomMax: number;
    onMove: (center: Coordinate, zoom?: number) => void;
};

const RMap: FC<RMapProps> = ({ position, zoom, zoomMin, zoomMax, onMove }) => {
    const mapTargetRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map>();

    // Création de la couche openlayers de fond (bg layer)
    const { data: capabilities } = useCapabilities();

    const bgLayer = useMemo(() => {
        if (!capabilities) return;

        const wmtsOptions = optionsFromCapabilities(capabilities, {
            layer: olDefaults.default_background_layer,
        });

        if (!wmtsOptions) return;

        const bgLayer = new TileLayer({
            source: new WMTS(wmtsOptions),
        });

        return bgLayer;
    }, [capabilities]);

    const center = useMemo(() => {
        return position ? fromLonLat(position) : fromLonLat(olDefaults.center);
    }, [position]);

    // Création de la carte une fois bg layer créée
    useEffect(() => {
        if (!bgLayer) return;

        const feature = new Feature(new Point(center));

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

        mapRef.current = new Map({
            target: mapTargetRef.current as HTMLElement,
            layers: [bgLayer, layer],
            controls: defaultControls().extend([new ScaleLine(), new DisplayCenterControl({})]),
            interactions: [
                new DragPan(),
                new MouseWheelZoom({
                    useAnchor: false,
                }),
            ],
            view: new View({
                center: center,
                zoom: zoom,
                minZoom: zoomMin,
                maxZoom: zoomMax,
            }),
        });

        mapRef.current.on("moveend", (e) => {
            const map = e.map;
            const centerView = map.getView().getCenter() as Coordinate;
            const z = map.getView().getZoom() as number;

            // Rien n'a bougé
            if (Math.round(z) === zoom && Math.abs(centerView[0] - center[0]) < 1 && Math.abs(centerView[1] - center[1]) < 1) {
                return;
            }
            onMove(centerView, Math.round(z) !== zoom ? z : undefined);
        });

        return () => mapRef.current?.setTarget(undefined);
    }, [bgLayer, center, zoom, zoomMin, zoomMax, onMove]);

    return <div ref={mapTargetRef} style={mapStyle} />;
};

export default RMap;
