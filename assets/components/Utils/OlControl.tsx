import type Control from "ol/control/Control";
import { useEffect } from "react";

import { useMapContext } from "@/contexts/MapContext";

type OlControlProps = {
    control?: Control | null;
};

export default function OlControl({ control }: OlControlProps) {
    const { map } = useMapContext();

    useEffect(() => {
        if (!map || !control) return;

        map.addControl(control);
        return () => {
            map.removeControl(control);
        };
    }, [map, control]);

    return null;
}
