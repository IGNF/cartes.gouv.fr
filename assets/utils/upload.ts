/** parse le tag integration_progress d’une livraison (objet JSON étape → statut) */
export const parseIntegrationProgress = (rawProgress: string | undefined): Record<string, string> | null => {
    if (!rawProgress) {
        return null;
    }

    try {
        const parsed = JSON.parse(rawProgress);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            return parsed as Record<string, string>;
        }
    } catch {
        // ignore les erreurs de parsing JSON
    }

    return null;
};

/** vrai si au moins une étape d’intégration a échoué */
export const integrationProgressHasFailure = (rawProgress: string | undefined): boolean =>
    Object.values(parseIntegrationProgress(rawProgress) ?? {}).includes("failed");
