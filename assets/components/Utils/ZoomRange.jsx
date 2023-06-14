import { fr } from "@codegouvfr/react-dsfr";
import PropTypes from "prop-types";
import React, { useState, useEffect, useRef } from "react";
import RangeSlider from "./RangeSlider";
import Map from "ol/Map";
import View from "ol/View";
import { fromLonLat } from "ol/proj";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import { optionsFromCapabilities } from "ol/source/WMTS";
import TileLayer from "ol/layer/Tile";
import WMTS from "ol/source/WMTS";

import "./../../sass/components/zoom-range.scss";


const ZoomRange = ({
    min, 
    max, 
    initialMinValue, 
    initialMaxValue, 
    center,
    onChange = null,
    minFixed = false,
    maxFixed = false}) => {
    const mapCenter = center ?? [2.35, 48.85];  // Paris
 
    const minZoomMapElement = useRef();
    const [minZoomMap, setMinZoomMap] = useState(null);
    
    const maxZoomMapElement = useRef();
    const [maxZoomMap, setMaxZoomMap] = useState(null);

    const handleOnChange = value => {
        if (value.minValue != minZoomMap.getView().getZoom()) {
            minZoomMap.getView().setZoom(value.minValue);    
        }
        if (value.maxValue != maxZoomMap.getView().getZoom()) {
            maxZoomMap.getView().setZoom(value.maxValue);    
        }
        if (onChange) {
            onChange(value);
        }
    };

    useEffect(() => {
        // create map
        const map1 = new Map({
            target: minZoomMapElement.current,
            view: new View({
                projection: "EPSG:3857",
                center: fromLonLat(mapCenter),
                zoom: initialMinValue
            }),
            controls: [],
            interactions: []
        });
        setMinZoomMap(map1);
			
        const map2 = new Map({
            target: maxZoomMapElement.current,
            view: new View({
                projection: "EPSG:3857",
                center: fromLonLat(mapCenter),
                zoom: initialMaxValue
            }),
            controls: [],
            interactions: []
        });
        setMaxZoomMap(map2);

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

                map1.addLayer(new TileLayer({
                    opacity: 1,
                    source: new WMTS(wmtsOptions)
                }));
                map2.addLayer(new TileLayer({
                    opacity: 1,
                    source: new WMTS(wmtsOptions)
                }));
            }).catch(error => { console.log(error); });
			
        /* We set map target to undefined to represent a
         * nonexistent HTML element ID, when the React component is unmounted.
         * This prevents multiple maps being added to the map container on a
         * re-render.
         */
        return () => {
            map1.setTarget(undefined);
            map2.setTarget(undefined);
        };
    },[]);

    return (
        <div className={fr.cx("fr-my-2v")}>
            <div className="ui-map-zoom-levels">
                <div ref={minZoomMapElement} className="ui-top-zoom-level"></div>
                <div ref={maxZoomMapElement} className="ui-bottom-zoom-level"></div>
            </div>
            <RangeSlider 
                min={min} 
                max={max} 
                initialMinValue={initialMinValue} 
                initialMaxValue={initialMaxValue} 
                minFixed={minFixed} 
                maxFixed={maxFixed} 
                onChange={handleOnChange}
            />
        </div>
    );
};

ZoomRange.propTypes = {
    min: PropTypes.number.isRequired,               // La valeur minimale possible pour le zoom
    max: PropTypes.number.isRequired,               // La valeur maximale possible pour le zoom
    initialMinValue: PropTypes.number,              // La valeur min initiale du zoom
    initialMaxValue: PropTypes.number,              // La valeur max initiale du zoom
    center: PropTypes.arrayOf(PropTypes.number),    // Le centre de la carte en lon/lat
    onChange: PropTypes.func,                       // function callback du parent
    minFixed: PropTypes.bool,                       // Est-ce que la valeur du zoom min est fixe
    maxFixed: PropTypes.bool                        // Est-ce que la valeur du zoom max est fixe
};

export default ZoomRange;
