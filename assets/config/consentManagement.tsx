import { createConsentManagement } from "@codegouvfr/react-dsfr/consentManagement";
import { startEulerianAnalytics } from "@codegouvfr/react-dsfr/eulerianAnalytics";
import { routes } from "../router/router";

const prEulerianApi = startEulerianAnalytics({
    domain: "acwg.cartes.gouv.fr", // domaine de tracking Eulerian
    site: {
        environment: "development", // TODO: dépendre de l'environnement
        entity: "IGN", // TODO: confirmer la valeur
    },
});

export const { ConsentBannerAndConsentManagement, FooterConsentManagementItem, FooterPersonalDataPolicyItem, useConsent } = createConsentManagement({
    finalityDescription: () => ({
        eulerianAnalytics: {
            title: "Eulerian Analytics",
            description: [
                "En cliquant sur 'Accepter', vous consentez à l'utilisation des cookies pour nous",
                "aider à améliorer notre site web en collectant et en rapportant des informations",
                "sur votre utilisation grâce à Eulerian Analytics. Si vous n'êtes pas d'accord, veuillez",
                "cliquer sur 'Refuser'. Votre expérience de navigation ne sera pas affectée.",
            ].join(" "),
        },
    }),
    personalDataPolicyLinkProps: {
        href: routes.personal_data().href,
    },
    consentCallback: async ({ finalityConsent }) => {
        const eulerian = await prEulerianApi;

        if (finalityConsent.eulerianAnalytics) {
            console.log("Enabling eulerian analytics");
            eulerian.enable();
        } else {
            console.log("Disabling eulerian analytics");
            eulerian.disable();
        }
    },
});
