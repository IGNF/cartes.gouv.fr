import { RegisteredLinkProps } from "@codegouvfr/react-dsfr/link";

import { catalogueUrl } from "@/env";
import SymfonyRouting from "@/modules/Routing";
import { appRoot, routes } from "./router";

export const externalUrls = {
    help: appRoot + "/aide/",
    helpProducerGuide: appRoot + "/aide/fr/guides-producteur/",
    helpProducerGuideGeneral: appRoot + "/aide/fr/guides-producteur/presentation-producteur/generalites-producteur/",
    helpUserGuideExploreMaps: appRoot + "/aide/fr/guides-utilisateur/visualiseur-cartographique/generalites-visualiseur/",
    helpUserGuideCatalogueGeneral: appRoot + "/aide/fr/guides-utilisateur/rechercher-une-donnee/generalites-catalogue/",
    helpUserGuideGeopfServicesTutorial: appRoot + "/aide/fr/guides-utilisateur/utiliser-les-services-de-la-geoplateforme/tutoriels/",
    helpProducerGuideCreateDatasheet: appRoot + "/aide/fr/guides-producteur/publier-des-donnees-via-cartes-gouv/deposer-donnees-sur-cartes-gouv/",
    helpUserGuideCreateKeys: appRoot + "/aide/fr/guides-utilisateur/creation-des-cles-et-integration-sig/",
    catalogue: catalogueUrl ?? appRoot + "/rechercher-une-donnee",
    maps: appRoot + "/explorer-les-cartes",
    contact_us: appRoot + "/aide/fr/nous-ecrire",
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
