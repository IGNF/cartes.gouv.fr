import analytics from "@codegouvfr/react-dsfr/dsfr/analytics";

declare global {
    interface Window {
        dsfr: {
            // analytics: EulerianAnalyticsParams; // au début je croyais que c'était ça, mais en fait ce sont les params d'initialisation de l'instance analytics, mais après la classe analytics exportée est différente

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // analytics: any;

            analytics: typeof analytics; // "analytics" est exporté comme "any", donc ne sert à rien
        };
    }
}
