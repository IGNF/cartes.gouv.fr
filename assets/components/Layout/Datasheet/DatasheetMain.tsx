import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import { useHead } from "@unhead/react";
import { ReactNode, memo } from "react";
import { tss } from "tss-react";

import useBreadcrumb from "@/hooks/useBreadcrumb";
import SessionExpiredAlert from "../../Utils/SessionExpiredAlert";
import { MainProps } from "../Main";

export type DatasheetMainProps = MainProps & {
    header: ReactNode;
    content: ReactNode;
    classes?: Partial<MainProps["classes"] & Record<"header", string>>;
};

function DatasheetMain(props: DatasheetMainProps) {
    const { header, content, customBreadcrumbProps, noticeProps, title } = props;

    useHead({
        titleTemplate: "%s | cartes.gouv.fr",
        title: title,
    });
    const breadcrumbProps = useBreadcrumb(customBreadcrumbProps);

    const { classes, cx } = useStyles();

    return (
        <main id="main" role="main" className={classes.main}>
            {noticeProps && <Notice isClosable {...noticeProps} />}

            <div className={cx(fr.cx("fr-container--fluid"))}>
                <div className={cx(fr.cx("fr-container"), classes.header)}>
                    {breadcrumbProps && <Breadcrumb className={classes.breadcrumb} {...breadcrumbProps} />}
                    <hr />

                    <SessionExpiredAlert />

                    {header}
                </div>
                {content}
            </div>
        </main>
    );
}

export default memo(DatasheetMain);

const useStyles = tss.withName({ DatasheetMain }).create({
    main: {
        backgroundColor: fr.colors.decisions.background.alt.grey.default,
    },
    header: {
        backgroundColor: fr.colors.decisions.background.default.grey.default,
    },
    breadcrumb: {
        marginTop: "0",
        paddingTop: "1rem",
    },
});
