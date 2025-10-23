import Control from "ol/control/Control";
import { useEffect } from "react";

import { useMapContext } from "@/contexts/MapContext";

/**
 * Exemple d'un control custom minimaliste: ajoute un bouton dans la barre de contrôles de la carte.
 * Montre comment ajouter/enlever un contrôle en utilisant le contexte de la carte.
 */
export default function TempButtonControl() {
    const { map } = useMapContext();

    useEffect(() => {
        if (!map) return;

        const button = document.createElement("button");
        button.type = "button";
        button.title = "Temp action";
        button.textContent = "Temp";
        button.addEventListener("click", () => {
            console.debug("[TempButtonControl] clicked");
        });

        const element = document.createElement("div");
        element.className = "ol-unselectable ol-control";
        element.style.padding = "0.25rem";
        element.appendChild(button);

        const control = new Control({ element });
        map.addControl(control);

        return () => {
            map.removeControl(control);
        };
    }, [map]);

    return null;
}
