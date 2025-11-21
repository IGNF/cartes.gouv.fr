import { RegisteredLinkProps } from "@codegouvfr/react-dsfr/link";

import { catalogueUrl } from "@/env";
import { appRoot, routes } from "./router";

export const externalUrls = {
    documentation: appRoot + "/aide/",
    documentationProducerGuide: appRoot + "/aide/fr/guide-producteur/",
    catalogue: catalogueUrl ?? appRoot + "/catalogue",
    maps: appRoot + "/cartes",
    contact_us: routes.contact().link.href,
    search_data: appRoot + "/recherche-une-donnee",
    publish_data: appRoot + "/publier-une-donnee",
    create_map: appRoot + "/creer-une-carte",
    discover_cartesgouvfr: routes.home().link.href,
} as const;

export function externalLink(route: keyof typeof externalUrls, title?: string): RegisteredLinkProps {
    return {
        href: externalUrls[route],
        target: "_blank",
        title: title ? `${title} - ouvre une nouvelle fenêtre` : "Ouvre une nouvelle fenêtre",
    };
}
