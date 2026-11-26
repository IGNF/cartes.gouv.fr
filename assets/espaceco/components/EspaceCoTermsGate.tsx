import CallOut from "@codegouvfr/react-dsfr/CallOut";
import { PropsWithChildren } from "react";

import Main from "@/components/Layout/Main";
import { isTermsNotAcceptedError } from "@/espaceco/esco_utils";
import useUserMe from "@/espaceco/hooks/useUserMe";
import { useTranslation } from "@/i18n/i18n";
import { externalLink } from "@/router/externalUrls";

export default function EspaceCoTermsGate({ children }: PropsWithChildren) {
    const { t } = useTranslation("EspaceCoTermsGate");
    // pas de relance au montage : le beforeLoad vient d’échouer, l’erreur reste affichée
    const { data, error } = useUserMe({ retryOnMount: false });

    if (data !== undefined) return children;
    if (error && !isTermsNotAcceptedError(error)) throw error;

    return (
        <Main title={t("page_title")}>
            <h1>{t("page_title")}</h1>
            <CallOut
                title={t("title")}
                titleAs="h2"
                buttonProps={{
                    children: t("accept"),
                    linkProps: externalLink("espacecoTerms", t("accept")),
                }}
            >
                {t("description")}
            </CallOut>
        </Main>
    );
}
