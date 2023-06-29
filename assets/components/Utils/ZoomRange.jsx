import { fr } from "@codegouvfr/react-dsfr";
import React, { useId, useState, useEffect } from "react";
import PropTypes from "prop-types";

// Openlayers
import Map from "ol/Map";
import View from "ol/View";
import { fromLonLat } from "ol/proj";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import { optionsFromCapabilities } from "ol/source/WMTS";
import TileLayer from "ol/layer/Tile";
import WMTS from "ol/source/WMTS";
import "./../../sass/components/zoom-range.scss";
import RangeSlider from "./RangeSlider";

const ZoomRange = (props) => {
    const { min = 0, max = 20, initialValues = [0, 20], center = [2.35, 48.85], onChange = null } = props;

    /* Identifiants des div contenant les maps */
    const numMaps = 2;
    const targets = [...new Array(numMaps)].map(() => "map-" + useId());

    const [minZoomMap, setMinZoomMap] = useState(null);
    const [maxZoomMap, setMaxZoomMap] = useState(null);

    const [values, setValues] = useState([Math.max(min, initialValues[0]), Math.min(max, initialValues[1])]);

    useEffect(() => {
        const maps = [];
        for (let m = 0; m < numMaps; ++m) {
            maps.push(
                new Map({
                    target: targets[m],
                    view: new View({
                        projection: "EPSG:3857",
                        center: fromLonLat(center),
                        zoom: values[m],
                    }),
                    controls: [],
                    interactions: [],
                })
            );
        }
        setMinZoomMap(maps[0]);
        setMaxZoomMap(maps[1]);

        /* Recuperation du GetCapabilities pour avoir les informations du flux PLANIGNV2 */
        fetch("https://wxs.ign.fr/cartes/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities")
            .then((response) => {
                if (!response.ok) {
                    throw response.statusText;
                }
                return response.text();
            })
            .then((response) => {
                const format = new WMTSCapabilities();
                const capabilities = format.read(response);

                const wmtsOptions = optionsFromCapabilities(capabilities, {
                    layer: "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2",
                    matrixSet: "EPSG:3857",
                });

                for (let m = 0; m < numMaps; ++m) {
                    maps[m].addLayer(
                        new TileLayer({
                            opacity: 1,
                            source: new WMTS(wmtsOptions),
                        })
                    );
                }
            })
            .catch((error) => {
                console.log(error);
            });

        /* We set map target to undefined to represent a
         * nonexistent HTML element ID, when the React component is unmounted.
         * This prevents multiple maps being added to the map container on a
         * re-render.
         */
        return () => {
            for (let m = 0; m < numMaps; ++m) {
                maps[m].setTarget(undefined);
            }
        };
    }, []);

    const handleOnChange = (values) => {
        setValues(values);
        minZoomMap?.getView().setZoom(values[0]);
        maxZoomMap?.getView().setZoom(values[1]);
        onChange?.onChange(values);
    };

    return (
        <div className={fr.cx("fr-my-2v")}>
            <div className="ui-map-zoom-levels">
                <div id={targets[0]} className="ui-top-zoom-level"></div>
                <div id={targets[1]} className="ui-bottom-zoom-level"></div>
            </div>
            <RangeSlider min={min} max={max} initialValues={initialValues} onChange={handleOnChange} />
        </div>
    );
};

ZoomRange.propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
    initialValues: PropTypes.arrayOf(PropTypes.number),
    center: PropTypes.arrayOf(PropTypes.number),
    onChange: PropTypes.func,
};

export default ZoomRange;
