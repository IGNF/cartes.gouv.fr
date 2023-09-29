import PropTypes from "prop-types";
import React, { useEffect, useRef } from "react";

import Map from "ol/Map";
import View from "ol/View";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import TileLayer from "ol/layer/Tile";
import { fromLonLat } from "ol/proj";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import olDefaults from "../../data/ol-defaults.json";
import "./../../sass/components/zoom-range.scss";

const MapWrapper = (props) => {
    // const [map, setMap] = useState(); // NOTE : code non-utilisé commenté temporairement pour que le GitHub Action passe

    // get ref to div element - OpenLayers will render into this div
    const mapElement = useRef();

    useEffect(() => {
        const center = props.center ?? olDefaults.center; // Paris

        // create map
        const initialMap = new Map({
            target: mapElement.current,
            view: new View({
                projection: "EPSG:3857",
                center: fromLonLat(center),
                zoom: props.zoom,
            }),
            controls: [],
        });
        // setMap(initialMap); // NOTE : code non-utilisé commenté temporairement pour que le GitHub Action passe

        // Ajout de la couche PLANIGNV2
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
                    layer: olDefaults.default_background_layer,
                    matrixSet: "EPSG:3857",
                });

                const layer = new TileLayer({
                    opacity: 1,
                    source: new WMTS(wmtsOptions),
                });
                initialMap.addLayer(layer);
            })
            .catch((error) => {
                console.log(error);
            });

        /* We set map target to undefined to represent a
         * nonexistent HTML element ID, when the React component is unmounted.
         * This prevents multiple maps being added to the map container on a
         * re-render.
         */
        return () => initialMap.setTarget(undefined);
    }, [props]);

    return <div ref={mapElement} className={props.className} id={props.id} />;
};

MapWrapper.propTypes = {
    id: PropTypes.string.isRequired,
    className: PropTypes.string,
    zoom: PropTypes.number.isRequired,
    center: PropTypes.arrayOf(PropTypes.number),
};

export default MapWrapper;
