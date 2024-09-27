import LayerSwitcher from "geoportal-extensions-openlayers/src/OpenLayers/Controls/LayerSwitcher";
import SearchEngine from "geoportal-extensions-openlayers/src/OpenLayers/Controls/SearchEngine";
import { View } from "ol";
import Map from "ol/Map";
import { Attribution, ScaleLine, defaults as defaultControls } from "ol/control";
import GeoJSON from "ol/format/GeoJSON";
import { defaults as defaultInteractions } from "ol/interaction";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import { FC, useEffect, useMemo, useRef } from "react";

import { Geometry as EntrepotGeometry } from "../../@types/entrepot";
import olDefaults from "../../data/ol-defaults.json";
import useCapabilities from "../../hooks/useCapabilities";

import "geoportal-extensions-openlayers/dist/GpPluginOpenLayers.css";
import "../../sass/components/map-view.scss";
import "../../sass/components/ol.scss";

type ExtentMapProps = {
    extents?: EntrepotGeometry | EntrepotGeometry[];
};

const ExtentMap: FC<ExtentMapProps> = ({ extents }) => {
    const mapTargetRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map>();

    const { data: capabilities } = useCapabilities();

    const extentLayer = useMemo(() => {
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
    }, [extents]);

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
        });

        const controls = defaultControls();
        controls.push(new Attribution({ collapsible: true, collapsed: true }));
        controls.push(layerSwitcher);
        controls.push(
            new SearchEngine({
                collapsed: false,
                displayAdvancedSearch: false,
                apiKey: "essentiels",
                zoomTo: "auto",
            })
        );
        controls.push(new ScaleLine());

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
        mapRef.current.getView().fit(extentLayer.getSource().getExtent());

        return () => mapRef.current?.setTarget(undefined);
    }, [bgLayer, extentLayer]);

    return <div ref={mapTargetRef} className="map-view" />;
};

export default ExtentMap;
