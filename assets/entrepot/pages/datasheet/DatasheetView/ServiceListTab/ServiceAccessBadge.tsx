import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";

import type { Service } from "@/@types/app";
import { useTranslation } from "@/i18n";

type ServiceAccessBadgeProps = {
    service: Service;
    /** flux privé consultable par tous sur cartes.gouv.fr (permission accordée à la communauté cartes.gouv.fr) */
    visibleOnCartesGouv: boolean;
};

export default function ServiceAccessBadge({ service, visibleOnCartesGouv }: ServiceAccessBadgeProps) {
    const { t } = useTranslation("ServicesListTabNext");

    if (service.open) {
        return (
            <Badge small noIcon className={fr.cx("fr-badge--blue-cumulus")}>
                {t("access.public")}
            </Badge>
        );
    }

    if (visibleOnCartesGouv) {
        return (
            <span title={t("access.private_visible_title")}>
                <Badge small noIcon className={fr.cx("fr-badge--purple-glycine")}>
                    {t("access.private_visible")}
                </Badge>
            </span>
        );
    }

    return (
        <Badge small noIcon className={fr.cx("fr-badge--purple-glycine")}>
            {t("access.private")}
        </Badge>
    );
}
