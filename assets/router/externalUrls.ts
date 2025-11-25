import { RegisteredLinkProps } from "@codegouvfr/react-dsfr/link";

import { catalogueUrl } from "@/env";
import { appRoot, routes } from "./router";

export const externalUrls = {
    documentation: appRoot + "/aide/",
    documentationProducerGuide: appRoot + "/aide/fr/guides-producteur/",
    catalogue: catalogueUrl ?? appRoot + "/catalogue",
    maps: appRoot + "/cartes",
    contact_us: routes.contact().link.href,
    discover_cartesgouvfr: routes.discover().link.href,
} as const;

export function externalLink(route: keyof typeof externalUrls, title?: string): RegisteredLinkProps {
    return {
        href: externalUrls[route],
        target: "_blank",
        title: title ? `${title} - ouvre une nouvelle fenêtre` : "Ouvre une nouvelle fenêtre",
    };
}
