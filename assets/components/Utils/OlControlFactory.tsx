import type Control from "ol/control/Control";
import { useEffect } from "react";

import { useMapContext } from "@/contexts/MapContext";

export type OlControlFactoryProps = {
    factory: () => Control | null;
    triggerRender?: unknown;
};

export default function OlControlFactory({ factory, triggerRender }: OlControlFactoryProps) {
    const { map } = useMapContext();

    useEffect(() => {
        if (!map) return;
        const instance = factory();
        if (!instance) return;
        map.addControl(instance);
        return () => {
            map.removeControl(instance);
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, triggerRender]);

    return null;
}
