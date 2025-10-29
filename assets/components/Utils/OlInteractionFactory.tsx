import type Interaction from "ol/interaction/Interaction";
import { useEffect } from "react";

import { useMapContext } from "@/contexts/MapContext";

type OlInteractionFactoryProps = {
    factory: () => Interaction | null;
    triggerRender?: unknown;
};

export default function OlInteractionFactory({ factory, triggerRender }: OlInteractionFactoryProps) {
    const { map } = useMapContext();

    useEffect(() => {
        if (!map) return;
        const instance = factory();
        if (!instance) return;
        map.addInteraction(instance);
        return () => {
            map.removeInteraction(instance);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, triggerRender]);

    return null;
}
