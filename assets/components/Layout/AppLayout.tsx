import { fr } from "@codegouvfr/react-dsfr";
import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation/MainNavigation";
import { Notice, addNoticeTranslations } from "@codegouvfr/react-dsfr/Notice";
import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";
import { FC, PropsWithChildren } from "react";

import { ConsentBannerAndConsentManagement } from "../../config/consentManagement";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import Translator from "../../modules/Translator";
import AppFooter from "./AppFooter";
import AppHeader from "./AppHeader";

type AppLayoutProps = {
    navItems?: MainNavigationProps.Item[];
    documentTitle?: string;
};

const AppLayout: FC<PropsWithChildren<AppLayoutProps>> = ({ children, navItems = [], documentTitle }) => {
    useDocumentTitle(documentTitle);

    addNoticeTranslations({
        lang: "fr",
        messages: {
            "hide message": "Fermer",
        },
    });
    const infoBannerMsg = document.getElementById("info_banner")?.dataset?.msg ?? undefined;

    return (
        <>
            {/* doit être le premier élément du DOM (Accessibilité) : https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/gestionnaire-de-consentement */}
            <ConsentBannerAndConsentManagement />
            {/* Lien d'evitement (skip link) */}
            <SkipLinks
                links={[
                    {
                        anchor: "#main",
                        label: Translator.trans("site.go_to_content"),
                    },
                ]}
            />

            <AppHeader navItems={navItems} />
            <main id="main" role="main">
                {/* doit être le premier élément atteignable après le lien d'évitement (Accessibilité) : https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/bandeau-d-information-importante */}
                {infoBannerMsg && <Notice title={infoBannerMsg} isClosable={true} />}

                <div className={fr.cx("fr-container", "fr-py-2w")}>{children}</div>
            </main>
            <AppFooter />
        </>
    );
};

export default AppLayout;
