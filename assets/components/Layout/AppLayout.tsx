import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";
import { addNoticeTranslations } from "@codegouvfr/react-dsfr/Notice";
import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";
import { FC, PropsWithChildren, memo, useMemo } from "react";

import { ConsentBannerAndConsentManagement } from "../../config/consentManagement";
import { defaultNavItems } from "../../config/navItems/navItems";
import { useTranslation } from "../../i18n/i18n";
import SnackbarMessage from "../Utils/SnackbarMessage";
import AppFooter from "./AppFooter";
import AppHeader from "./AppHeader";

const HiddenElements: FC = () => {
    const { t } = useTranslation("Common");

    return (
        <>
            {/* doit être le premier élément du DOM (Accessibilité) : https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/gestionnaire-de-consentement */}
            <ConsentBannerAndConsentManagement />
            {/* Lien d'evitement (skip link) */}
            <SkipLinks
                links={[
                    {
                        anchor: "#main",
                        label: t("go_to_content"),
                    },
                ]}
            />
        </>
    );
};

const HiddenElementsMemoized = memo(HiddenElements);

export interface AppLayoutProps {
    navItems?: MainNavigationProps.Item[];
}

const AppLayout: FC<PropsWithChildren<AppLayoutProps>> = ({ children, navItems }) => {
    const { t } = useTranslation("navItems");
    const nav = useMemo(() => navItems ?? defaultNavItems(t), [navItems, t]);

    return (
        <>
            <HiddenElementsMemoized />
            <AppHeader navItems={nav} />
            {children}
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
