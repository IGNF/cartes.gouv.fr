import { RegisteredLinkProps } from "@codegouvfr/react-dsfr/link";

import { catalogueUrl } from "@/env";
import SymfonyRouting from "@/modules/Routing";
import { appRoot, routes } from "./router";

export const externalUrls = {
    documentation: appRoot + "/aide/",
    documentationProducerGuide: appRoot + "/aide/fr/guides-producteur/",
    documentationProducerGuideGeneral: appRoot + "/aide/fr/guides-producteur/presentation-producteur/generalites-producteur/",
    documentationExploreMaps: appRoot + "/aide/fr/guides-utilisateur/visualiseur-cartographique/generalites-visualiseur/",
    documentationUserGuideCatalogueGeneral: appRoot + "/aide/fr/guides-utilisateur/rechercher-une-donnee/generalites-catalogue/",
    documentationCreateDatasheet: appRoot + "/aide/fr/guides-producteur/publier-des-donnees-via-cartes-gouv/deposer-donnees-sur-cartes-gouv/",
    catalogue: catalogueUrl ?? appRoot + "/catalogue",
    maps: appRoot + "/cartes",
    contact_us: routes.contact().link.href,
    discover_cartesgouvfr: routes.discover().link.href,
    login: SymfonyRouting.generate("cartesgouvfr_security_login"),
    logout: SymfonyRouting.generate("cartesgouvfr_security_logout"),
} as const;

export function externalLink(route: keyof typeof externalUrls, title?: string): RegisteredLinkProps {
    return {
        href: externalUrls[route],
        target: "_blank",
        title: title ? `${title} - ouvre une nouvelle fenêtre` : "Ouvre une nouvelle fenêtre",
    };
}
