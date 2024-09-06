import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb, BreadcrumbProps } from "@codegouvfr/react-dsfr/Breadcrumb";
import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";
import { Notice, addNoticeTranslations } from "@codegouvfr/react-dsfr/Notice";
import { SkipLinks } from "@codegouvfr/react-dsfr/SkipLinks";
import { useQuery } from "@tanstack/react-query";
import { FC, PropsWithChildren, ReactNode, memo, useMemo } from "react";

import { ConsentBannerAndConsentManagement } from "../../config/consentManagement";
import { defaultNavItems } from "../../config/navItems";
import api from "../../entrepot/api";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { useTranslation } from "../../i18n/i18n";
import Translator from "../../modules/Translator";
import RQKeys from "../../modules/entrepot/RQKeys";
import getBreadcrumb from "../../modules/entrepot/breadcrumbs";
import { useRoute } from "../../router/router";
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

type AppLayoutProps = {
    navItems?: MainNavigationProps.Item[];
    documentTitle?: string;
    customBreadcrumbProps?: BreadcrumbProps;
    infoBannerMsg?: ReactNode;
};

const AppLayout: FC<PropsWithChildren<AppLayoutProps>> = ({ children, navItems, documentTitle, customBreadcrumbProps, infoBannerMsg }) => {
    useDocumentTitle(documentTitle);
    const { t } = useTranslation("navItems");

    const route = useRoute();

    const datastoreQuery = useQuery({
        // @ts-expect-error fausse alerte
        queryKey: RQKeys.datastore(route.params.datastoreId),
        // @ts-expect-error fausse alerte
        queryFn: ({ signal }) => api.datastore.get(route.params.datastoreId, { signal }),
        staleTime: 3600000,
        enabled: "datastoreId" in route.params,
    });

    const breadcrumbProps = useMemo(() => {
        if (customBreadcrumbProps !== undefined) {
            return customBreadcrumbProps;
        }

        return getBreadcrumb(route, datastoreQuery.data);
    }, [route, datastoreQuery.data, customBreadcrumbProps]);

    navItems = useMemo(() => navItems ?? defaultNavItems(t), [navItems, t]);

    return (
        <>
            <HiddenElementsMemoized />
            <AppHeader navItems={navItems} />
            <main id="main" role="main" className={fr.cx("fr-my-2w")}>
                {/* doit être le premier élément atteignable après le lien d'évitement (Accessibilité) : https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/bandeau-d-information-importante */}
                {infoBannerMsg && <Notice title={infoBannerMsg} isClosable={true} />}

                <div className={fr.cx("fr-container")}>
                    {breadcrumbProps && <Breadcrumb {...breadcrumbProps} />}

                    <div className={fr.cx("fr-mb-4v")}>
                        <SessionExpiredAlert />
                    </div>

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
