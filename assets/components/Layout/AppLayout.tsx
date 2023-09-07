import { fr } from "@codegouvfr/react-dsfr";
import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation/MainNavigation";
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

    return (
        <>
            {/* Lien d'evitement (skip link) */}
            <SkipLinks
                links={[
                    {
                        anchor: "#main",
                        label: Translator.trans("site.go_to_content"),
                    },
                ]}
            />
            <ConsentBannerAndConsentManagement />
            <AppHeader navItems={navItems} />
            <main id="main" role="main" className={fr.cx("fr-py-2w")}>
                <div className={fr.cx("fr-container")}>{children}</div>
            </main>
            <AppFooter />
        </>
    );
};

export default AppLayout;
