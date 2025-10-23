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
import IgnfDsfrHeader from "./IgnfDsfrHeader";

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
            <IgnfDsfrHeader
                menuItems={[
                    {
                        label: "Mon espace",
                        icon: "fr-icon-user-line",
                        connectionMenu: true,
                        links: [
                            { label: "Mon profil", href: "/profil", icon: "fr-icon-user-line" },
                            { label: "Mes organisations", href: "/organisations", icon: "fr-icon-group-line" },
                        ],
                    },
                    {
                        label: "Aide",
                        icon: "fr-icon-question-line",
                        links: [
                            { label: "Documentation", href: "/docs", icon: "fr-icon-book-2-line" },
                            { label: "Contact", href: "/contact", icon: "fr-icon-mail-line" },
                        ],
                    },
                ]}
            />
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
