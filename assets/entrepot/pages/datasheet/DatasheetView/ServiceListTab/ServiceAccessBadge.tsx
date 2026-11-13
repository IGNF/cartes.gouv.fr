import Tag from "@codegouvfr/react-dsfr/Tag";

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
            <Tag small as="span">
                {t("access.public")}
            </Tag>
        );
    }

    if (visibleOnCartesGouv) {
        return (
            <Tag small as="span" title={t("access.private_visible_title")}>
                {t("access.private_visible")}
            </Tag>
        );
    }

    return (
        <Tag small as="span">
            {t("access.private")}
        </Tag>
    );
}
