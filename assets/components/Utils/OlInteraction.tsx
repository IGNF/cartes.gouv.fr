import type Interaction from "ol/interaction/Interaction";
import { useEffect } from "react";

import { useMapContext } from "@/contexts/MapContext";

type OlInteractionProps = {
    interaction?: Interaction | null;
};

export default function OlInteraction(props: OlInteractionProps) {
    const { interaction } = props;
    const { map } = useMapContext();

    useEffect(() => {
        if (!map || !interaction) return;

        map.addInteraction(interaction);
        return () => {
            map.removeInteraction(interaction);
        };
    }, [map, interaction]);

    return null;
}
