import Tag from "@codegouvfr/react-dsfr/Tag";

import type { ServiceListItem } from "@/@types/app";
import { useTranslation } from "@/i18n";

type ServiceAccessBadgeProps = {
    service: ServiceListItem;
};

// accès inconnu (permissions non lues) : affiché « Privé »
export default function ServiceAccessBadge({ service }: ServiceAccessBadgeProps) {
    const { t } = useTranslation("ServicesListTabNext");

    if (service.access === "public") {
        return (
            <Tag small as="span">
                {t("access.public")}
            </Tag>
        );
    }

    if (service.access === "restricted_visible") {
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
