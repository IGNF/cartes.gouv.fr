import Badge from "@codegouvfr/react-dsfr/Badge";

import { useTranslation } from "@/i18n";
import { exploreMapsLayerUrl, externalLinkToUrl } from "@/router/externalUrls";
import type { ExploreMapsAvailability } from "@/utils";

type ServiceExploreMapsCellProps = {
    availability: ExploreMapsAvailability;
    layerParam?: string;
};

export default function ServiceExploreMapsCell({ availability, layerParam }: ServiceExploreMapsCellProps) {
    const { t } = useTranslation("ServicesListTabNext");

    if (availability === "pending") {
        return (
            <Badge small severity="info">
                {t("explore.pending")}
            </Badge>
        );
    }

    if (availability === "available" && layerParam !== undefined) {
        return <a {...externalLinkToUrl(exploreMapsLayerUrl(layerParam), t("explore.link_title"))}>{t("explore.link")}</a>;
    }

    return <span title={t("explore.unavailable_title")}>-</span>;
}
