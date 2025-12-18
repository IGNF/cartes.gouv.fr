import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { PropsWithChildren } from "react";
import { tss } from "tss-react";

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
> & {
    classes?: Partial<MainProps["classes"] & Record<"content", string>>;
};

export default function DatastoreMain(props: DatastoreMainProps) {
    const { datastoreId, communityId, children, customBreadcrumbProps, noticeProps, title, classes: propsClasses } = props;

    useDocumentTitle(title);
    const breadcrumbProps = useBreadcrumb(customBreadcrumbProps);

    const { classes } = useStyles();

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
            <div className={propsClasses?.container ?? fr.cx("fr-container")}>
                <div className={fr.cx("fr-grid-row")}>
                    <div
                        className={cx(fr.cx("fr-col-12", "fr-col-md-3"), classes?.sideMenuCol)} // "fr-pl-5w"
                    >
                        <DatastoreSideMenu datastoreId={datastoreId} communityId={communityId} />

                        <ButtonsGroup
                            className={fr.cx("fr-mb-md-6v", "fr-mr-md-8v")}
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
                                {
                                    children: "Ajouter un entrepôt",
                                    linkProps: routes.datastore_add().link,
                                    priority: "secondary",
                                },
                            ]}
                        />
                    </div>
                    <div className={cx(fr.cx("fr-col-12", "fr-col-md-9"), classes.content, propsClasses?.content)}>
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

const useStyles = tss.withName({ DatastoreMain }).create({
    sideMenuCol: {
        display: "flex",
        flexDirection: "column",
        gap: fr.spacing("10v"),
        borderRight: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
    },
    content: {
        padding: "0 1rem",
    },
});
