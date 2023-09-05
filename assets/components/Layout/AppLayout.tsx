import { fr } from "@codegouvfr/react-dsfr";
import { FC, PropsWithChildren } from "react";
import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";
import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation/MainNavigation";
import AppFooter from "./AppFooter";
import AppHeader from "./AppHeader";
import { ConsentBannerAndConsentManagement } from "../../config/consentManagement";
import Translator from "../../modules/Translator";

type AppLayoutProps = {
    navItems?: MainNavigationProps.Item[];
};

const AppLayout: FC<PropsWithChildren<AppLayoutProps>> = ({ children, navItems = [] }) => {
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
