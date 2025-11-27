import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import Button from "@codegouvfr/react-dsfr/Button";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import { PropsWithChildren } from "react";

import DatastoreSideMenu from "@/components/Layout/DatastoreSideMenu";
import useBreadcrumb from "@/hooks/useBreadcrumb";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import SessionExpiredAlert from "../Utils/SessionExpiredAlert";
import { MainProps } from "./Main";

export type DatastoreMainProps = PropsWithChildren<MainProps>;
export default function DatastoreMain(props: DatastoreMainProps) {
    const { children, customBreadcrumbProps, noticeProps, title, fluidContainer = false } = props;

    useDocumentTitle(title);
    const breadcrumbProps = useBreadcrumb(customBreadcrumbProps);

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
                        <DatastoreSideMenu />

                        <Button className={fr.cx("fr-mt-md-auto", "fr-mb-md-6v", "fr-mr-md-8v")} priority="secondary">
                            Ajouter un entrepôt
                        </Button>
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
