import { fr } from "@codegouvfr/react-dsfr";
import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";
import { Notice, addNoticeTranslations } from "@codegouvfr/react-dsfr/Notice";
import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";
import { FC, PropsWithChildren, memo, useMemo } from "react";

import { ConsentBannerAndConsentManagement } from "../../config/consentManagement";
import { defaultNavItems } from "../../config/navItems";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { useTranslation } from "../../i18n/i18n";
import Translator from "../../modules/Translator";
import SessionExpiredAlert from "../Utils/SessionExpiredAlert";
import SnackbarMessage from "../Utils/SnackbarMessage";
import AppFooter from "./AppFooter";
import AppHeader from "./AppHeader";

const HiddenElements: FC = () => {
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
        </>
    );
};

const HiddenElementsMemoized = memo(HiddenElements);

const infoBannerMsg = document.getElementById("info_banner")?.dataset?.msg ?? undefined;

type AppLayoutProps = {
    navItems?: MainNavigationProps.Item[];
    documentTitle?: string;
};
const AppLayout: FC<PropsWithChildren<AppLayoutProps>> = ({ children, navItems, documentTitle }) => {
    useDocumentTitle(documentTitle);
    const { t } = useTranslation("navItems");

    navItems = useMemo(() => navItems ?? defaultNavItems(t), [navItems, t]);

    return (
        <>
            <HiddenElementsMemoized />
            <AppHeader navItems={navItems} />
            <main id="main" role="main" className={fr.cx("fr-my-2w")}>
                {/* doit être le premier élément atteignable après le lien d'évitement (Accessibilité) : https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/bandeau-d-information-importante */}
                {infoBannerMsg && <Notice title={infoBannerMsg} isClosable={true} />}

                <div className={fr.cx("fr-container", "fr-py-2w")}>
                    <SessionExpiredAlert />
                    {children}
                </div>
            </main>
            <AppFooter />
            <SnackbarMessage />
        </>
    );
};

export default memo(AppLayout);

addNoticeTranslations({
    lang: "fr",
    messages: {
        "hide message": "Fermer",
    },
});
