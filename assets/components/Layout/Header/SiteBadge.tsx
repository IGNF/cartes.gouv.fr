import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { useMatches } from "@tanstack/react-router";

import { routeSpace } from "@/router/routeSpace";

export default function SiteBadge() {
    const space = useMatches({ select: routeSpace });

    if (space === "publish") {
        return (
            <Badge className={fr.cx("fr-badge--green-archipel")} noIcon={true} as="span" small={true}>
                <span className={fr.cx("fr-icon--sm", "fr-icon-database-line", "fr-mr-1v")} aria-hidden="true" />
                Publier
            </Badge>
        );
    }

    if (space === "contribute") {
        return (
            <Badge className={fr.cx("fr-badge--green-bourgeon")} noIcon={true} as="span" small={true}>
                <span className={fr.cx("fr-icon--sm", "fr-icon-message-2-fill", "fr-mr-1v")} aria-hidden="true" />
                Contribuer
            </Badge>
        );
    }

    return null;
}
