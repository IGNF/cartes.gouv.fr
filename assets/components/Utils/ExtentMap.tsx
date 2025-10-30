import Alert from "@codegouvfr/react-dsfr/Alert";
import LayerSwitcher from "geopf-extensions-openlayers/src/packages/Controls/LayerSwitcher/LayerSwitcher";
import SearchEngine from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/SearchEngine";
import GeoportalZoom from "geopf-extensions-openlayers/src/packages/Controls/Zoom/GeoportalZoom";
import { Feature, View } from "ol";
import Map from "ol/Map";
import { ScaleLine } from "ol/control";
import GeoJSON from "ol/format/GeoJSON";
import { fromExtent } from "ol/geom/Polygon";
import { defaults as defaultInteractions } from "ol/interaction";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat, transformExtent } from "ol/proj";
import VectorSource from "ol/source/Vector";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import { FC, useEffect, useMemo, useRef } from "react";

import type { BoundingBox, Geometry as EntrepotGeometry } from "../../@types/entrepot";
import olDefaults from "../../data/ol-defaults.json";
import useCapabilities from "../../hooks/useCapabilities";

import "ol/ol.css";

import "geopf-extensions-openlayers/css/Dsfr.css";

import "../../sass/components/geopf-ext-ol-custom.scss";
import "../../sass/components/map-view.scss";

type ExtentMapProps = {
    extents?: EntrepotGeometry | EntrepotGeometry[];
    bbox?: BoundingBox;
};

const ExtentMap: FC<ExtentMapProps> = ({ extents, bbox }) => {
    const mapRef = useRef<Map>();
    const mapTargetRef = useRef<HTMLDivElement>(null);

    const { data: capabilities } = useCapabilities();

    const extentLayer = useMemo(() => {
        if (bbox !== undefined) {
            const feature = new Feature(fromExtent(transformExtent([bbox.west, bbox.south, bbox.east, bbox.north], "EPSG:4326", "EPSG:3857")));

            return new VectorLayer({
                source: new VectorSource({
                    features: [feature],
                }),
            });
        }

        if (!extents) return;

        const _extents = Array.isArray(extents) ? extents : [extents];

        const extentFeatures = _extents
            .map((ext) =>
                new GeoJSON({
                    dataProjection: "EPSG:4326",
                    featureProjection: "EPSG:3857",
                }).readFeatures(ext)
            )
            .flat();

        const extentSource = new VectorSource({
            features: extentFeatures,
        });

        return new VectorLayer({
            source: extentSource,
        });
    }, [bbox, extents]);

    const extentLayerSource = extentLayer?.getSource();
    const extentLayerExtent = extentLayerSource?.getExtent();
    const extentValid = extentLayerExtent?.every((c) => isFinite(c));

    const bgLayer = useMemo(() => {
        if (!capabilities) return;

        const wmtsOptions = optionsFromCapabilities(capabilities, {
            layer: olDefaults.default_background_layer,
        });

        if (!wmtsOptions) return;

        const bgLayer = new TileLayer();
        bgLayer.setSource(new WMTS(wmtsOptions));

        return bgLayer;
    }, [capabilities]);

    useEffect(() => {
        if (!bgLayer || !extentLayer) return;

        const layerSwitcher = new LayerSwitcher({
            layers: [
                {
                    layer: bgLayer,
                    config: {
                        title: "Plan IGN v2",
                    },
                },
                {
                    layer: extentLayer,
                    config: {
                        title: "Emprise",
                    },
                },
            ],
            options: {
                position: "top-right",
                collapsed: true,
                panel: true,
                counter: true,
            },
        });

        const controls = [
            layerSwitcher,
            new SearchEngine({
                collapsed: false,
                displayButtonAdvancedSearch: false,
                apiKey: "essentiels",
                zoomTo: "auto",
            }),
            new ScaleLine(),
            new GeoportalZoom({ position: "top-left" }),
        ];

        mapRef.current = new Map({
            target: mapTargetRef.current as HTMLElement,
            layers: [bgLayer, extentLayer],
            interactions: defaultInteractions(),
            controls: controls,
            view: new View({
                projection: olDefaults.projection,
                center: fromLonLat(olDefaults.center),
                zoom: olDefaults.zoom,
            }),
        });

        if (extentLayerExtent !== undefined && extentValid === true) {
            mapRef.current.getView().fit(extentLayerExtent);
        }

        return () => mapRef.current?.setTarget(undefined);
    }, [bgLayer, extentLayer, extentLayerExtent, extentValid]);

    if (extentValid === false) {
        return <Alert title="Emprise invalide" description="L'emprise de la donnée est invalide" severity="warning" />;
    }

    return <div ref={mapTargetRef} className="map-view" />;
};

export default ExtentMap;
