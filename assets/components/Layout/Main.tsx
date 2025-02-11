import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb, BreadcrumbProps } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import { PropsWithChildren, memo, useContext, useMemo } from "react";

import getBreadcrumb from "../../modules/entrepot/breadcrumbs/Breadcrumb";
import { useRoute } from "../../router/router";
import SessionExpiredAlert from "../Utils/SessionExpiredAlert";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { datastoreContext } from "../../contexts/datastore";
import { IUseAlert } from "@/hooks/useAlert";

export interface MainProps {
    customBreadcrumbProps?: BreadcrumbProps;
    noticeProps?: IUseAlert;
    title?: string;
}

function Main(props: PropsWithChildren<MainProps>) {
    const { children, customBreadcrumbProps, noticeProps, title } = props;
    const route = useRoute();
    useDocumentTitle(title);
    const datastoreValue = useContext(datastoreContext);

    const breadcrumbProps = useMemo(() => {
        if (customBreadcrumbProps !== undefined) {
            return customBreadcrumbProps;
        }

        return getBreadcrumb(route, datastoreValue.datastore);
    }, [route, datastoreValue.datastore, customBreadcrumbProps]);

    return (
        <main id="main" role="main">
            {/* doit être le premier élément atteignable après le lien d'évitement (Accessibilité) : https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/bandeau-d-information-importante */}
            {noticeProps && <Notice isClosable {...noticeProps} />}

            <div className={fr.cx("fr-container", "fr-my-2w")}>
                {breadcrumbProps && <Breadcrumb {...breadcrumbProps} />}

                <div className={fr.cx("fr-mb-4v")}>
                    <SessionExpiredAlert />
                </div>

                {children}
            </div>
        </main>
    );
}

export default memo(Main);
