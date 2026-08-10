import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { useHead } from "@unhead/react";
import { PropsWithChildren } from "react";
import { tss } from "tss-react";

import DatastoreSideMenu from "@/entrepot/components/DatastoreSideMenu";
import useBreadcrumb from "@/entrepot/hooks/useBreadcrumb";
import SessionExpiredAlert from "@/components/Utils/SessionExpiredAlert";
import { type MainProps } from "@/components/Layout/Main";

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

    useHead({
        titleTemplate: "%s | cartes.gouv.fr",
        title: title,
    });
    const breadcrumbProps = useBreadcrumb(customBreadcrumbProps);

    const { classes } = useStyles();

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
                                    children: "Ajouter un entrepôt",
                                    linkProps: { to: "/tableau-de-bord/entrepots/demande-de-creation" },
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
