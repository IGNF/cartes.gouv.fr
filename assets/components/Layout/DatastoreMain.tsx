import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import { PropsWithChildren } from "react";

import DatastoreSideMenu from "@/components/Layout/DatastoreSideMenu";
import useBreadcrumb from "@/hooks/useBreadcrumb";
import useDatastoreSelection from "@/hooks/useDatastoreSelection";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { routes } from "@/router/router";
import LoadingText from "../Utils/LoadingText";
import SessionExpiredAlert from "../Utils/SessionExpiredAlert";
import Main, { type MainProps } from "./Main";

export type DatastoreMainProps = PropsWithChildren<
    MainProps & {
        datastoreId?: string;
        communityId?: string;
    }
>;
export default function DatastoreMain(props: DatastoreMainProps) {
    const { datastoreId, communityId, children, customBreadcrumbProps, noticeProps, title, fluidContainer = false } = props;

    useDocumentTitle(title);
    const breadcrumbProps = useBreadcrumb(customBreadcrumbProps);

    const { sandboxDatastore } = useDatastoreSelection();
    if (!sandboxDatastore) {
        return (
            <Main>
                <LoadingText />
            </Main>
        );
    }

    return (
        <main id="main" role="main">
            {noticeProps && <Notice isClosable {...noticeProps} />}
            <div className={fr.cx(fluidContainer ? "fr-container--fluid" : "fr-container")}>
                <div className={fr.cx("fr-grid-row")}>
                    <div
                        className={fr.cx("fr-col-12", "fr-col-md-3")} // "fr-pl-5w"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <DatastoreSideMenu datastoreId={datastoreId} communityId={communityId} />

                        <ButtonsGroup
                            className={fr.cx("fr-mt-md-auto", "fr-mb-md-6v", "fr-mr-md-8v")}
                            buttons={[
                                {
                                    children: "Rejoindre un entrepôt",
                                    linkProps: routes.join_community().link,
                                    priority: "secondary",
                                },
                                {
                                    children: "Créer un entrepôt",
                                    linkProps: routes.datastore_create_request().link,
                                    priority: "secondary",
                                },
                            ]}
                            style={{
                                zIndex: "16000",
                            }}
                        />
                    </div>
                    <div className={fr.cx("fr-col-12", "fr-col-md-9")}>
                        {/* // "fr-px-5w" */}
                        {breadcrumbProps && <Breadcrumb {...breadcrumbProps} />}
                        <SessionExpiredAlert />
                        {children}
                    </div>
                </div>
            </div>
        </main>
    );
}
