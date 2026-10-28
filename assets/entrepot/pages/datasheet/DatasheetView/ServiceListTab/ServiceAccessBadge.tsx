import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";

import type { Service } from "@/@types/app";

type ServiceAccessBadgeProps = {
    service: Service;
    /** flux privé consultable par tous sur cartes.gouv.fr (permission accordée à la communauté cartes.gouv.fr) */
    visibleOnCartesGouv: boolean;
};

export default function ServiceAccessBadge({ service, visibleOnCartesGouv }: ServiceAccessBadgeProps) {
    if (service.open) {
        return (
            <Badge small noIcon className={fr.cx("fr-badge--blue-cumulus")}>
                Public
            </Badge>
        );
    }

    if (visibleOnCartesGouv) {
        return (
            <span title="Le flux est privé mais reste disponible à la visualisation pour tous les utilisateurs sur cartes.gouv.fr">
                <Badge small noIcon className={fr.cx("fr-badge--purple-glycine")}>
                    Privé*
                </Badge>
            </span>
        );
    }

    return (
        <Badge small noIcon className={fr.cx("fr-badge--purple-glycine")}>
            Privé
        </Badge>
    );
}
