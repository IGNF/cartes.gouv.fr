import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import Map from "ol/Map";
import View from "ol/View";
import { fromLonLat } from "ol/proj";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import { optionsFromCapabilities } from "ol/source/WMTS";
import TileLayer from "ol/layer/Tile";
import WMTS from "ol/source/WMTS";
import "./../../sass/components/zoom-range.scss";


const MapWrapper = (props) => {
    const [ map, setMap ] = useState();
    
    // get ref to div element - OpenLayers will render into this div
    const mapElement = useRef();

    useEffect(() => {
        const center = props.center ?? [2.35, 48.85];  // Paris

        // create map
        const initialMap = new Map({
            target: mapElement.current,
            view: new View({
                projection: "EPSG:3857",
                center: fromLonLat(center),
                zoom: props.zoom
            }),
            controls: []
        });
        setMap(initialMap);
			
        // Ajout de la couche PLANIGNV2
        fetch("https://wxs.ign.fr/cartes/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities")
            .then((response) => {
                if (! response.ok) {
                    throw response.statusText;
                }
                return response.text();
            }).then((response) => {
                const format = new WMTSCapabilities();
                const capabilities = format.read(response);

                const wmtsOptions = optionsFromCapabilities(capabilities, {
                    layer: "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2",
                    matrixSet: "EPSG:3857"
                });

                const layer = new TileLayer({
                    opacity: 1,
                    source: new WMTS(wmtsOptions)
                });
                initialMap.addLayer(layer);
            }).catch(error => { console.log(error); });
			
        /* We set map target to undefined to represent a
         * nonexistent HTML element ID, when the React component is unmounted.
         * This prevents multiple maps being added to the map container on a
         * re-render.
         */
        return () => initialMap.setTarget(undefined);
    },[]);

    return (
        <div ref={mapElement} className={props.className} id={props.id}></div>
    );
};

MapWrapper.propTypes = {
    id: PropTypes.string.isRequired,
    className: PropTypes.string,
    zoom: PropTypes.number.isRequired,
    center: PropTypes.arrayOf(PropTypes.number)
};

export default MapWrapper;