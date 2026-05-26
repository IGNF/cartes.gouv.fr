import Alert from "@codegouvfr/react-dsfr/Alert";
import LayerSwitcher from "geopf-extensions-openlayers/src/packages/Controls/LayerSwitcher/LayerSwitcher";
import SearchEngine from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/SearchEngine";
import GeoportalZoom from "geopf-extensions-openlayers/src/packages/Controls/Zoom/GeoportalZoom";
import { Feature } from "ol";
import { ScaleLine } from "ol/control";
import GeoJSON from "ol/format/GeoJSON";
import { fromExtent } from "ol/geom/Polygon";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat, transformExtent } from "ol/proj";
import VectorSource from "ol/source/Vector";
import { FC, useEffect, useMemo } from "react";

import type { BoundingBox, JsonNode } from "../../@types/entrepot";
import OlBackgroundLayer from "@/components/Map/OlBackgroundLayer";
import OlControl from "@/components/Map/OlControl";
import OlLayer from "@/components/Map/OlLayer";
import { OlMapProvider } from "@/components/Map/OlMapContext";
import useBboxFit from "@/components/Map/useBboxFit";
import useOlMap from "@/components/Map/useOlMap";
import olDefaults from "../../data/ol-defaults.json";

import "ol/ol.css";

import "geopf-extensions-openlayers/css/Dsfr.css";

import "../../sass/components/geopf-ext-ol-custom.scss";
import "../../sass/components/map-view.scss";

type ExtentMapProps = {
    extents?: JsonNode | JsonNode[];
    bbox?: BoundingBox;
};

const ExtentMap: FC<ExtentMapProps> = ({ extents, bbox }) => {
    const extentLayer = useMemo(() => {
        if (bbox !== undefined) {
            const feature = new Feature(fromExtent(transformExtent([bbox.west, bbox.south, bbox.east, bbox.north], "EPSG:4326", "EPSG:3857")));
            const layer = new VectorLayer({
                source: new VectorSource({ features: [feature] }),
            });
            layer.set("title", "Emprise");
            return layer;
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

        const layer = new VectorLayer({
            source: new VectorSource({ features: extentFeatures }),
        });
        layer.set("title", "Emprise");
        return layer;
    }, [bbox, extents]);

    const extentLayerSource = extentLayer?.getSource();
    const extentLayerExtent = extentLayerSource?.getExtent();
    const extentValid = extentLayerExtent?.every((c) => isFinite(c));

    const zoomControl = useMemo(() => new GeoportalZoom({ position: "top-left" }), []);
    const layerSwitcher = useMemo(
        () =>
            new LayerSwitcher({
                options: {
                    position: "top-right",
                    collapsed: true,
                    panel: true,
                    counter: true,
                },
            }),
        []
    );
    const scaleLine = useMemo(() => new ScaleLine(), []);
    const searchEngine = useMemo(
        () =>
            new SearchEngine({
                collapsed: false,
                displayButtonAdvancedSearch: false,
                apiKey: "essentiels",
                zoomTo: "auto",
            }),
        []
    );

    const { map, targetRef } = useOlMap({
        initialView: {
            projection: olDefaults.projection,
            center: fromLonLat(olDefaults.center),
            zoom: olDefaults.zoom,
        },
        defaultControls: false,
    });

    // Fit via BoundingBox lon/lat quand bbox est fournie
    useBboxFit(map, bbox);

    // Fit sur l'extent vectoriel (EPSG:3857) quand extents est utilisé à la place de bbox
    useEffect(() => {
        if (!map || !extentLayerExtent || bbox !== undefined || extentValid !== true) return;
        map.getView().fit(extentLayerExtent);
    }, [map, extentLayerExtent, bbox, extentValid]);

    if (extentValid === false) {
        return <Alert title="Emprise invalide" description="L'emprise de la donnée est invalide" severity="warning" />;
    }

    return (
        <OlMapProvider map={map}>
            <OlControl control={zoomControl} />
            <OlControl control={layerSwitcher} />
            <OlControl control={scaleLine} />
            <OlControl control={searchEngine} />
            <OlBackgroundLayer />
            {extentLayer && <OlLayer layer={extentLayer} />}
            <div className="map-view" ref={targetRef} />
        </OlMapProvider>
    );
};

export default ExtentMap;
