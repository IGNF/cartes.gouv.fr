import { unByKey } from "ol/Observable";
import { useEffect } from "react";

import { useMapContext } from "@/contexts/MapContext";

/**
 * Composant exemple qui démontre comment consommer la carte openlayers via le contexte.
 * On logge le centre et le zoom à chaque fin de déplacement.
 */
export default function MapViewLogger() {
    const { map } = useMapContext();

    useEffect(() => {
        if (!map) return;

        const logState = () => {
            const view = map.getView();
            const center = view.getCenter();
            const zoom = view.getZoom();
            console.debug("[MapViewLogger] center:", center, "zoom:", zoom);
        };

        // logger une fois au mount
        logState();

        // écouter l'événement moveend pour éviter de spammer pendant l'interaction
        const key = map.on("moveend", logState);

        return () => {
            // supprimer le listener
            unByKey(key);
        };
    }, [map]);

    return null;
}
