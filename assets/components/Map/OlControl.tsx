import type Control from "ol/control/Control";
import { useEffect } from "react";

import { useOlMapContext } from "./OlMapContext";

type OlControlProps = {
    control?: Control | null;
};

export default function OlControl({ control }: OlControlProps) {
    const { map } = useOlMapContext();

    useEffect(() => {
        if (!map || !control) return;

        map.addControl(control);
        return () => {
            map.removeControl(control);
        };
    }, [map, control]);

    return null;
}
