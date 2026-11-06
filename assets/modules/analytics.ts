import { startEulerianAnalytics } from "@codegouvfr/react-dsfr/eulerianAnalytics";
import { type AnyRouter } from "@tanstack/react-router";

import { appEnv } from "@/env";

declare global {
    interface Window {
        _paq?: unknown[][];
    }
}

// Clé écrite par l’ancienne bannière de consentement react-dsfr
const LEGACY_CONSENT_STORAGE_KEY = "@codegouvfr/react-dsfr finalityConsent eulerianAnalytics";
// Opt-out posés par la page /donnees-personnelles (même origine) : cookie Matomo, clé localStorage du module analytics du DSFR
const MATOMO_OPTOUT_COOKIE = "mtm_consent_removed";
const EULERIAN_OPTOUT_STORAGE_KEY = "_EA_";
const MATOMO_HOST = "https://matomo.ign.fr/";
const MATOMO_SITE_ID = "11";

export function isMatomoOptedOut(cookie = document.cookie): boolean {
    return cookie.split(";").some((item) => item.trim().split("=")[0] === MATOMO_OPTOUT_COOKIE);
}

export function isEulerianOptedOut(storage: Pick<Storage, "getItem"> = localStorage): boolean {
    return storage.getItem(EULERIAN_OPTOUT_STORAGE_KEY) !== null;
}

export async function analyticsInit() {
    localStorage.removeItem(LEGACY_CONSENT_STORAGE_KEY);

    if (!isMatomoOptedOut()) {
        matomoInit();
    }

    // le module DSFR refuse de démarrer si l’utilisateur a refusé ; on ne force jamais enable()
    if (!isEulerianOptedOut()) {
        try {
            await startEulerianAnalytics({
                domain: "acwg.cartes.gouv.fr",
                site: {
                    environment: appEnv === "prod" ? "production" : "development",
                    entity: "IGN",
                },
            });
        } catch (error) {
            console.error("Eulerian analytics initialization failed", error);
        }
    }
}

function matomoInit() {
    const _paq = (window._paq = window._paq ?? []);
    _paq.push(["setTrackerUrl", MATOMO_HOST + "matomo.php"]);
    _paq.push(["setSiteId", MATOMO_SITE_ID]);
    _paq.push(["setDoNotTrack", true]);
    _paq.push(["enableLinkTracking"]);
    const g = document.createElement("script");
    const s = document.getElementsByTagName("script")[0];
    g.async = true;
    g.src = MATOMO_HOST + "matomo.js";
    s.parentNode?.insertBefore(g, s);
}

type MatchForTitle = { routeId: string; staticData: { matomoLabel?: string } };

/** titre de la page vue : préfixe par espace, libellé de la feuille matchée (sans feuille, page introuvable) */
export function matomoPageTitle(matches: MatchForTitle[]): string {
    const prefix = matches.some((match) => match.routeId === "/_private/espace-collaboratif") ? "[Contribuer]" : "[Publier]";
    const label = matches.at(-1)?.staticData.matomoLabel ?? "Page introuvable";

    return `${prefix} ${label}`;
}

/** page vue Matomo à chaque navigation, sans paramètres de requête, avec l’URL précédente comme référent */
export function trackPageViews(router: AnyRouter) {
    let previousUrl = document.referrer.split("?")[0];
    router.subscribe("onResolved", () => {
        if (!window._paq) return;
        const currentUrl = window.location.origin + window.location.pathname;

        window._paq.push(["setReferrerUrl", previousUrl]);
        window._paq.push(["setCustomUrl", currentUrl]);
        window._paq.push(["setDocumentTitle", matomoPageTitle(router.state.matches)]);
        window._paq.push(["trackPageView"]);
        previousUrl = currentUrl;
    });
}
