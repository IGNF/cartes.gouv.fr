import Badge from "@codegouvfr/react-dsfr/Badge";

import { exploreMapsLayerUrl, externalLinkToUrl } from "@/router/externalUrls";
import type { ExploreMapsAvailability } from "@/utils";

type ServiceExploreMapsCellProps = {
    availability: ExploreMapsAvailability;
    layerParam?: string;
};

export const EXPLORE_MAPS_UNAVAILABLE_TITLE = "Ce flux n’est pas visualisable dans Explorer les cartes";

export default function ServiceExploreMapsCell({ availability, layerParam }: ServiceExploreMapsCellProps) {
    if (availability === "pending") {
        return (
            <Badge small noIcon severity="info">
                En cours
            </Badge>
        );
    }

    if (availability === "available" && layerParam !== undefined) {
        return <a {...externalLinkToUrl(exploreMapsLayerUrl(layerParam), "Voir dans Explorer les cartes")}>Lien</a>;
    }

    return <span title={EXPLORE_MAPS_UNAVAILABLE_TITLE}>-</span>;
}
