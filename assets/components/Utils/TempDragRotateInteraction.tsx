import DragRotateAndZoom from "ol/interaction/DragRotateAndZoom";
import { useMemo } from "react";

import OlInteraction from "./OlInteraction";

/**
 * Démo minimale qui ajoute l'interaction DragRotateAndZoom.
 */
export default function TempDragRotateInteraction() {
    const interaction = useMemo(() => new DragRotateAndZoom(), []);
    return <OlInteraction interaction={interaction} />;
}
